import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { type NodePath, type PluginItem, types as babelTypes, transformAsync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import { type Plugin, normalizePath, transformWithOxc } from 'vite';
import sirv from 'sirv';
import { useHead } from 'unhead';
import { createHead, transformHtmlTemplate } from 'unhead/server';
import { buildTemplateVars, getLocaleSiteData, renderTemplateVars } from '@/shared/utils';
import { resolveServerPageHead } from '@/shared/title';
import {
  CLIENT_ENTRY_PATH,
  CLIENT_EXPORTS_PATH,
  DEFAULT_EXTERNALS,
  DEFAULT_THEME_PATH,
  MD_REGEX,
  PACKAGE_ROOT,
  SHARED_PATH,
  SX_REGEX,
  isProduction,
} from '../constants';
import { injectIntoHtml, resolveBaseTemplate } from '../html';
import { buildRoutesModule, findRoute } from '../routes';
import type { SiteConfig } from '@/shared/types';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Virtual modules — server-side state surfaced to the client bundle
// ---------------------------------------------------------------------------

const VIRTUAL_PREFIX = '\0';

function pluginVirtualModules(config: SiteConfig): Plugin {
  const modules: Record<string, () => string> = {
    'athen:site-data': () => `export default ${JSON.stringify(config.siteData)}`,
    'athen:base': () => `export default ${JSON.stringify(config.siteData.base || '/')}`,
  };
  return {
    name: 'athen:virtual-modules',
    resolveId(id) {
      if (id in modules) return VIRTUAL_PREFIX + id;
      if (isProduction() && DEFAULT_EXTERNALS.includes(id)) return { id, external: true };
    },
    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const key = id.slice(VIRTUAL_PREFIX.length);
        return modules[key]?.();
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Conventional routes virtual module (`athen:routes`)
// ---------------------------------------------------------------------------

export const CONVENTIONAL_ROUTE_ID = 'athen:routes';

export function pluginRoute(config: SiteConfig): Plugin {
  return {
    name: 'athen:routes',
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) return `\0${CONVENTIONAL_ROUTE_ID}`;
    },
    load(id) {
      if (id === `\0${CONVENTIONAL_ROUTE_ID}`) {
        return buildRoutesModule(config._routes ?? [], config.siteData);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Vite config: aliases, optimizeDeps, dev watcher, public dir
// ---------------------------------------------------------------------------

function runtimeAliases() {
  const essorDist = dirname(require.resolve('essor', { paths: [PACKAGE_ROOT] }));
  const essorClient = join(essorDist, 'essor.esm.js');
  const essorServer = join(essorDist, 'server.esm.js');
  const essorRouter = join(
    dirname(require.resolve('essor-router', { paths: [PACKAGE_ROOT] })),
    'index.mjs',
  );

  return [
    { find: /^essor$/, replacement: essorClient },
    { find: /^essor\/server$/, replacement: essorServer },
    { find: /^essor-router$/, replacement: essorRouter },
  ];
}

function pluginConfig(config: SiteConfig, restartServer?: () => Promise<void>): Plugin {
  return {
    name: 'athen:config',
    config() {
      return {
        root: PACKAGE_ROOT,
        optimizeDeps: {
          include: ['essor', 'essor-router', 'lodash-es', 'copy-to-clipboard', 'fs-extra', 'vite'],
          exclude: ['fsevents'],
        },
        resolve: {
          alias: [
            ...runtimeAliases(),
            { find: '@theme', replacement: config.themeDir },
            { find: '@runtime', replacement: CLIENT_EXPORTS_PATH },
            { find: '@shared', replacement: SHARED_PATH },
            { find: '@theme-default', replacement: DEFAULT_THEME_PATH },
          ],
        },
        build: { target: 'baseline-widely-available' },
      };
    },
    async handleHotUpdate(ctx) {
      if (ctx.file.includes(normalizePath(config.configPath))) {
        console.warn(`\n${relative(config.root, ctx.file)} changed, restarting server...`);
        await restartServer?.();
      }
    },
    configureServer(server) {
      const publicDir = join(config.root, 'public');
      if (existsSync(publicDir)) server.middlewares.use(sirv(publicDir));
    },
  };
}

// ---------------------------------------------------------------------------
// Dev HTML middleware: per-request `template.html` → transformIndexHtml
// ---------------------------------------------------------------------------

function pluginIndexHtml(config: SiteConfig): Plugin {
  const routes = config._routes ?? [];

  return {
    name: 'athen:index-html',
    transformIndexHtml: {
      handler(html, ctx) {
        const url = ctx.originalUrl || ctx.path || ctx.filename || '/';
        const matched = findRoute(routes, url);
        const locale = getLocaleSiteData(config.siteData, matched?.localePrefix);

        // Static (site-level) template vars — `{{ favicon }}` only after the
        // title/description/lang placeholders were removed from BASE_TEMPLATE.
        const vars = buildTemplateVars(config.siteData, locale);
        let nextHtml = renderTemplateVars(html, vars);

        // Per-route head — same locale-aware resolution as the SSG build, so
        // dev HTML's first paint matches what production emits.
        const head = createHead();
        useHead(head, resolveServerPageHead(config.siteData, matched, locale));
        nextHtml = transformHtmlTemplate(head, nextHtml);

        return {
          html: nextHtml,
          tags: [
            ...(config.siteData.head?.map(([tag, attrs, children]) => ({ tag, attrs, children })) ??
              []),
            {
              tag: 'script',
              attrs: { type: 'module', src: `/@fs/${CLIENT_ENTRY_PATH}` },
              injectTo: 'body',
            },
          ],
        };
      },
    },
    configureServer(server) {
      if (config.configPath) {
        server.watcher.add(config.configPath);
        config.configDeps?.forEach((dep) => server.watcher.add(dep));
      }
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (res.writableEnded || !req.url) return next();

          try {
            const raw = await resolveBaseTemplate(config.root);
            const html = await server.transformIndexHtml(req.url, raw, req.originalUrl);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
          } catch (error) {
            next(error);
          }
        });
      };
    },
  };
}

// ---------------------------------------------------------------------------
// JSX / MDX transform (build-only) — strips TS via oxc, applies Essor Babel
// ---------------------------------------------------------------------------

function essorImportRewriter() {
  return {
    name: 'athen:rewrite-server-for-import',
    visitor: {
      ImportDeclaration(p: NodePath<babelTypes.ImportDeclaration>) {
        if (p.node.source.value !== 'essor') return;

        const serverSpecifiers = p.node.specifiers.filter(
          (spec): spec is babelTypes.ImportSpecifier =>
            babelTypes.isImportSpecifier(spec) &&
            babelTypes.isIdentifier(spec.imported) &&
            spec.imported.name === 'For',
        );
        if (serverSpecifiers.length === 0) return;

        p.node.specifiers = p.node.specifiers.filter(
          (spec): spec is babelTypes.ImportSpecifier =>
            !serverSpecifiers.includes(spec as babelTypes.ImportSpecifier),
        );
        p.insertAfter(
          babelTypes.importDeclaration(serverSpecifiers, babelTypes.stringLiteral('essor/server')),
        );
        if (p.node.specifiers.length === 0) p.remove();
      },
    },
  };
}

function pluginTransform(isServer: boolean): Plugin {
  return {
    name: 'athen:transform',
    apply: 'build',
    async transform(code, id) {
      if (!SX_REGEX.test(id) && !MD_REGEX.test(id)) return;
      const stripped = await transformWithOxc(code, id, { jsx: 'preserve', lang: 'tsx' });
      const babelPlugins: PluginItem[] = [
        [BabelPluginEssor, { hmr: false, mode: isServer ? 'hydrate' : 'server' }],
      ];
      if (!isServer) babelPlugins.push(essorImportRewriter());
      const result = await transformAsync(stripped.code, {
        filename: id,
        sourceType: 'module',
        plugins: babelPlugins,
      });
      return { code: result?.code ?? code, map: result?.map ?? undefined, moduleType: 'js' };
    },
  };
}

// ---------------------------------------------------------------------------
// Composition entry point
// ---------------------------------------------------------------------------

export function pluginAthen(
  config: SiteConfig,
  isServer = false,
  restartServer?: () => Promise<void>,
): Plugin[] {
  return [
    pluginVirtualModules(config),
    pluginConfig(config, restartServer),
    pluginIndexHtml(config),
    pluginTransform(isServer),
  ];
}

// Re-export so existing public surface continues to work.
export { injectIntoHtml, pluginConfig };
