import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  type InlineConfig,
  type Plugin,
  build as viteBuild,
  mergeConfig,
} from 'vite';
import fs from 'fs-extra';
import { withBase } from '@/runtime';
import { resolveConfig } from './config';
import { DIST_DIR, PACKAGE_ROOT, SSG_ENTRY_PATH, SSR_ENTRY_PATH } from './constants';
import { applyHtmlTransforms, flattenPlugins } from './htmlTransforms';
import { createVitePlugins } from './plugins';
import type { Router, SiteConfig } from '@/shared/types';

type RenderFunction = (routePath: string) => string | Promise<string>;
type BundleItem =
  | {
    type: 'asset';
    fileName: string;
  }
  | {
    type: 'chunk';
    fileName: string;
    isEntry: boolean;
  };
type BuildBundle = {
  output: BundleItem[];
};

function normalizeHtmlFilePath(path: string) {
  if (path.endsWith('/')) {
    return `${path}index.html`.replace(/^\//, '');
  }

  return `${path}.html`.replace(/^\//, '');
}

function isEntryChunk(item: BundleItem) {
  return item.type === 'chunk' && item.isEntry;
}

function isCssAsset(item: BundleItem) {
  return item.type === 'asset' && item.fileName.endsWith('.css');
}

function uniqueCssAssets(...bundles: BuildBundle[]) {
  const cssAssets = bundles.flatMap(bundle => bundle.output.filter(isCssAsset));

  return cssAssets.filter(
    (asset, index) => cssAssets.findIndex(item => item.fileName === asset.fileName) === index,
  );
}

function renderHeadTags(head: NonNullable<SiteConfig['siteData']>['head'] = []) {
  return head
    .map(([tag, attrs, children]) => {
      if (attrs && typeof attrs === 'object') {
        const attributes = Object.entries(attrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        const openTag = `<${tag}${attributes ? ` ${attributes}` : ''}>`;

        return children == null ? openTag : `${openTag}${children}</${tag}>`;
      }

      return `<${tag}>${children ?? ''}</${tag}>`;
    })
    .join('\n');
}

export async function renderPage(
  render: RenderFunction,
  root: string,
  clientBundle: BuildBundle,
  ssgBundle: BuildBundle,
  config: SiteConfig,
  routers: Required<Router>[],
  htmlPlugins: Plugin[] = [],
) {
  const clientChunk = clientBundle.output.find(isEntryChunk);
  if (!clientChunk) {
    throw new Error('Unable to find the production client entry chunk.');
  }

  const { siteData } = config;
  const ssgCssAssets = ssgBundle.output.filter(isCssAsset);
  const cssAssets = uniqueCssAssets(clientBundle, ssgBundle);
  const distPath = join(root, DIST_DIR);
  const tempPath = join(root, '.temp');
  const siteBase = siteData.base || '/';
  const withSiteBase = (fileName: string) => withBase(fileName, siteBase);
  const headTags = renderHeadTags(siteData.head);

  for (const css of ssgCssAssets) {
    await fs.copy(join(tempPath, css.fileName), join(distPath, css.fileName));
  }

  for (const route of routers) {
    const routePath = route.path;
    const appHtml = await render(routePath);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset=utf-8>
          <meta http-equiv=X-UA-Compatible content="IE=edge">
          <meta name=viewport content="width=device-width,initial-scale=1">
          <title>${siteData.title || 'Athen'}</title>
          <meta name="description" content="${siteData.description || 'Athen'}">
          ${headTags}
          <link rel="icon" href="${siteData.icon}" type="image/svg+xml">
          ${cssAssets.map((item) => `<link rel="stylesheet" href="${withSiteBase(item.fileName)}">`).join('\n')}
        </head>
        <body>
          <div id="app">${appHtml}</div>
          <script type="module" src="${withSiteBase(clientChunk.fileName)}"></script>
        </body>
      </html>`.trim();
    const fileName = normalizeHtmlFilePath(routePath);
    const transformedHtml = await applyHtmlTransforms(
      html,
      { path: routePath, filename: join(distPath, fileName) },
      htmlPlugins,
    );

    await fs.ensureDir(join(distPath, dirname(fileName)));
    await fs.outputFile(join(distPath, fileName), transformedHtml);
  }
}

export async function bundle(root: string, config: SiteConfig) {
  const createBuildConfig = async (isClient: boolean): Promise<InlineConfig> => {
    const plugins = await createVitePlugins(config, isClient);
    const isSsrBuild = !isClient;

    const defaultBuildConfig: InlineConfig = {
      mode: 'production',
      root,
      resolve: {
        alias: {
          '@': resolve(PACKAGE_ROOT, 'src'),
        },
      },
      define: {
        'import.meta.env.SSR': `${isSsrBuild}`,
      },
      plugins,
      ssr: {
        noExternal: true,
      },
      esbuild: {
        jsx: 'preserve',
      },
      build: {
        emptyOutDir: true,
        ssr: isSsrBuild,
        ssrEmitAssets: isSsrBuild,
        outDir: isClient ? join(root, DIST_DIR) : join(root, '.temp'),
        rollupOptions: {
          input: isClient ? SSR_ENTRY_PATH : SSG_ENTRY_PATH,
        },
        target: 'baseline-widely-available',
      },
    };

    return mergeConfig(config.vite || {}, defaultBuildConfig);
  };

  const ssgBuildConfig = await createBuildConfig(false);
  const clientBuildConfig = await createBuildConfig(true);
  const ssgBundle = await viteBuild(ssgBuildConfig);
  const clientBundle = await viteBuild(clientBuildConfig);

  return [ssgBundle, clientBundle, flattenPlugins(clientBuildConfig.plugins)] as [
    BuildBundle,
    BuildBundle,
    Plugin[],
  ];
}
export async function build(root: string = process.cwd()) {
  const config = await resolveConfig(root, 'build', 'production');

  // Handle multi-instance builds by recursing into each instance root
  if (config.instances?.length) {
    for (const inst of config.instances) {
      await build(join(root, inst.root));
    }
    return;
  }

  const tempPath = join(root, '.temp');
  const distPath = join(root, DIST_DIR);
  await fs.remove(tempPath);
  await fs.remove(distPath);

  const [ssgBundle, clientBundle, htmlPlugins] = await bundle(root, config);

  const serverEntryPath = join(tempPath, 'ssg-entry.js');
  const { render, routes } = await import(pathToFileURL(serverEntryPath).href);

  await renderPage(render, root, clientBundle, ssgBundle, config, routes, htmlPlugins);

  const publicDirInRoot = join(root, 'public');
  if (await fs.pathExists(publicDirInRoot)) {
    await fs.copy(publicDirInRoot, distPath);
  }

  const indexHtmlPath = join(root, 'index.html');
  if (await fs.pathExists(indexHtmlPath)) {
    const indexHtml = await fs.readFile(indexHtmlPath);
    await fs.outputFile(join(distPath, 'index.html'), indexHtml);
  }
}
