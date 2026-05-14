import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { type InlineConfig, build as viteBuild } from 'vite';
import fs from 'fs-extra';
import { withBase } from '@/runtime';
import { version } from '../../package.json';
import { resolveConfig } from './config';
import { DIST_DIR, PACKAGE_ROOT, SSG_ENTRY_PATH, SSR_ENTRY_PATH } from './constants';
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
) {
  const clientChunk = clientBundle.output.find(isEntryChunk);
  if (!clientChunk) {
    throw new Error('Unable to find the production client entry chunk.');
  }

  const ssgCssAssets = ssgBundle.output.filter(isCssAsset);
  const cssAssets = uniqueCssAssets(clientBundle, ssgBundle);
  const distPath = join(root, DIST_DIR);
  const tempPath = join(root, '.temp');
  const siteBase = config.siteData?.base || config.base || '/';
  const withSiteBase = (fileName: string) => withBase(fileName, siteBase);
  const headTags = renderHeadTags(config.siteData?.head);

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
          <title>${config.siteData!.title || 'Athen'}</title>
          <meta name="description" content="${version}">
          ${headTags}
          <link rel="icon" href="${config.siteData!.icon}" type="image/svg+xml">
          ${cssAssets.map((item) => `<link rel="stylesheet" href="${withSiteBase(item.fileName)}">`).join('\n')}
        </head>
        <body>
          <div id="app">${appHtml}</div>
          <script type="module" src="${withSiteBase(clientChunk.fileName)}"></script>
        </body>
      </html>`.trim();
    const fileName = normalizeHtmlFilePath(routePath);

    await fs.ensureDir(join(distPath, dirname(fileName)));
    await fs.outputFile(join(distPath, fileName), html);
  }
}

export async function bundle(root: string, options) {
  const createBuildConfig = async (isClient: boolean): Promise<InlineConfig> => {
    const plugins = await createVitePlugins(options, isClient);
    const isSsrBuild = !isClient;

    return {
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
  };

  const ssgBundle = await viteBuild(await createBuildConfig(false));
  const clientBundle = await viteBuild(await createBuildConfig(true));

  return [ssgBundle, clientBundle] as [BuildBundle, BuildBundle];
}
export async function build(root: string = process.cwd()) {
  // First, resolve config to check for instances
  const preConfig = await resolveConfig(root, 'build', 'production');
  if (Array.isArray(preConfig.instances) && preConfig.instances.length > 0) {
    for (const inst of preConfig.instances) {
      const instRoot = join(root, inst.root);
      await build(instRoot);
    }
    return;
  }
  const tempPath = join(root, '.temp');
  const distPath = join(root, DIST_DIR);
  await fs.remove(tempPath);
  await fs.remove(distPath);

  const config = await resolveConfig(root, 'build', 'production');

  const [ssgBundle, clientBundle] = await bundle(root, config);

  const serverEntryPath = join(tempPath, 'ssg-entry.js');
  const fileUrl = pathToFileURL(serverEntryPath).href;

  const { render, routes } = await import(fileUrl);

  await renderPage(render, root, clientBundle, ssgBundle, config, routes);
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
