import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { type InlineConfig, type Plugin, mergeConfig, build as viteBuild } from 'vite';
import fs from 'fs-extra';
import { useHead } from 'unhead';
import { transformHtmlTemplate } from 'unhead/server';
import { withBase } from '@/runtime';
import {
  buildTemplateVars,
  getLocaleSiteData,
  htmlFilePathFromRoute,
  renderTemplateVars,
} from '@/shared/utils';
import { resolveServerPageHead } from '@/shared/title';
import { checkBrokenLinks } from './brokenLinks';
import { resolveConfig } from './config';
import {
  PACKAGE_ROOT,
  SSG_ENTRY_PATH,
  SSR_ENTRY_PATH,
  resolveOutDir,
  resolveTempDir,
} from './constants';
import {
  applyHtmlTransforms,
  flattenPlugins,
  injectIntoHtml,
  renderHeadTags,
  resolveBaseTemplate,
} from './html';
import { createVitePlugins } from './plugins';
import type { SSRHeadPayload, Unhead } from 'unhead/types';
import type { Router, SiteConfig } from '@/shared/types';

type RenderResult = { html: string; head: Unhead<Record<string, unknown>, SSRHeadPayload> };
type RenderFunction = (routePath: string) => Promise<RenderResult>;
type BundleItem =
  | { type: 'asset'; fileName: string }
  | { type: 'chunk'; fileName: string; isEntry: boolean };
type BuildBundle = { output: BundleItem[] };

interface PageAssets {
  cssLinks: string;
  clientScript: string;
  siteHeadTags: string;
  template: string;
  distPath: string;
}

const isEntryChunk = (item: BundleItem) => item.type === 'chunk' && item.isEntry;
const isCssAsset = (item: BundleItem) => item.type === 'asset' && item.fileName.endsWith('.css');

function uniqueCssAssets(...bundles: BuildBundle[]) {
  const seen = new Set<string>();
  const out: BundleItem[] = [];
  for (const bundle of bundles) {
    for (const item of bundle.output) {
      if (!isCssAsset(item) || seen.has(item.fileName)) continue;
      seen.add(item.fileName);
      out.push(item);
    }
  }
  return out;
}

/**
 * Prepare per-build artifacts:
 *  - Pick the client entry script.
 *  - Deduplicate CSS assets across SSG+client bundles.
 *  - Copy SSG-only CSS into `dist/`.
 *  - Read (and cache) the HTML template + site-level head tags.
 */
async function prepareAssets(
  clientBundle: BuildBundle,
  ssgBundle: BuildBundle,
  root: string,
  config: SiteConfig,
): Promise<PageAssets> {
  const clientChunk = clientBundle.output.find(isEntryChunk);
  if (!clientChunk) throw new Error('Unable to find the production client entry chunk.');

  const distPath = join(root, resolveOutDir(config));
  const tempPath = join(root, resolveTempDir(config));
  const siteBase = config.siteData.base || '/';
  const withSiteBase = (fileName: string) => withBase(fileName, siteBase);

  const ssgCss = ssgBundle.output.filter(isCssAsset);
  for (const css of ssgCss) {
    await fs.copy(join(tempPath, css.fileName), join(distPath, css.fileName));
  }

  return {
    cssLinks: uniqueCssAssets(clientBundle, ssgBundle)
      .map((item) => `<link rel="stylesheet" href="${withSiteBase(item.fileName)}">`)
      .join('\n'),
    clientScript: `<script type="module" src="${withSiteBase(clientChunk.fileName)}"></script>`,
    siteHeadTags: renderHeadTags(config.siteData.head),
    template: await resolveBaseTemplate(root),
    distPath,
  };
}

async function renderRouteHtml(
  route: Router,
  render: RenderFunction,
  config: SiteConfig,
  assets: PageAssets,
  htmlPlugins: Plugin[],
): Promise<{ html: string; fileName: string }> {
  const { html: appHtml, head } = await render(route.path);
  const locale = getLocaleSiteData(config.siteData, route.localePrefix);

  // Layer the build-time, locale-aware route meta on top of whatever the SSR
  // entry already pushed. Later `useHead` calls win in Unhead, so this is the
  // authoritative source for per-route title / description / `<html lang>`.
  useHead(head, resolveServerPageHead(config.siteData, route, locale));

  const vars = buildTemplateVars(config.siteData, locale);
  const localeHeadTags = locale?.head ? renderHeadTags(locale.head) : '';
  let html = renderTemplateVars(assets.template, vars);
  html = injectIntoHtml(html, {
    head: [assets.siteHeadTags, localeHeadTags, assets.cssLinks].filter(Boolean).join('\n'),
    app: appHtml,
    body: assets.clientScript,
  });
  html = transformHtmlTemplate(head, html);

  const fileName = htmlFilePathFromRoute(route.path, config);
  const transformedHtml = await applyHtmlTransforms(
    html,
    { path: route.path, filename: join(assets.distPath, fileName) },
    htmlPlugins,
  );
  return { html: transformedHtml, fileName };
}

export async function renderPage(
  render: RenderFunction,
  root: string,
  clientBundle: BuildBundle,
  ssgBundle: BuildBundle,
  config: SiteConfig,
  routers: Router[],
  htmlPlugins: Plugin[] = [],
) {
  const assets = await prepareAssets(clientBundle, ssgBundle, root, config);
  for (const route of routers) {
    const { html, fileName } = await renderRouteHtml(route, render, config, assets, htmlPlugins);
    await fs.ensureDir(join(assets.distPath, dirname(fileName)));
    await fs.outputFile(join(assets.distPath, fileName), html);
  }
}

export async function bundle(root: string, config: SiteConfig) {
  const createBuildConfig = async (isClient: boolean): Promise<InlineConfig> => {
    const plugins = await createVitePlugins(config, isClient);
    const isSsrBuild = !isClient;
    const buildConfig = mergeConfig(
      {
        root,
        resolve: {
          alias: {
            '@': resolve(PACKAGE_ROOT, 'src'),
          },
        },
        esbuild: {
          jsx: 'preserve',
        },
        build: {
          target: 'baseline-widely-available',
        },
      },
      {
        mode: 'production',
        define: { 'import.meta.env.SSR': `${isSsrBuild}` },
        plugins,
        ssr: { noExternal: true },
        build: {
          emptyOutDir: true,
          ssr: isSsrBuild,
          ssrEmitAssets: isSsrBuild,
          outDir: isClient ? join(root, resolveOutDir(config)) : join(root, resolveTempDir(config)),
          rollupOptions: { input: isClient ? SSR_ENTRY_PATH : SSG_ENTRY_PATH },
        },
      },
    );
    return mergeConfig(config.vite || {}, buildConfig);
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

  const tempPath = join(root, resolveTempDir(config));
  const distPath = join(root, resolveOutDir(config));
  await fs.remove(tempPath);
  await fs.remove(distPath);

  if (config.onBrokenLinks && config.onBrokenLinks !== 'ignore') {
    await checkBrokenLinks({
      routes: config._routes ?? [],
      onBrokenLinks: config.onBrokenLinks,
      urlPolicy: config,
    });
  }

  const [ssgBundle, clientBundle, htmlPlugins] = await bundle(root, config);

  const serverEntryPath = join(tempPath, 'ssgEntry.js');
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
