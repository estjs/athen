import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { type Plugin, normalizePath } from 'vite';
import sirv from 'sirv';
import {
  CLIENT_EXPORTS_PATH,
  DEFAULT_THEME_PATH,
  PACKAGE_ROOT,
  SHARED_PATH,
  SSG_ROUTER_PATH,
  SSG_SERVER_PATH,
} from '../../constants';
import type { SiteConfig } from '@shared/types';

const SITE_DATA_ID = 'athen:site-data';
const require = createRequire(import.meta.url);

function createRuntimeAliases(isClient: boolean) {
  const essorDistDir = dirname(require.resolve('essor', { paths: [PACKAGE_ROOT] }));
  const essorClientEntry = join(essorDistDir, 'essor.esm.js');
  const essorServerEntry = join(essorDistDir, 'server.esm.js');
  const essorRouterDistDir = dirname(require.resolve('essor-router', { paths: [PACKAGE_ROOT] }));
  const essorRouterEntry = join(essorRouterDistDir, 'index.mjs');

  return [
    {
      find: /^athen:ssg-essor-server$/,
      replacement: essorServerEntry,
    },
    {
      find: /^athen:ssg-essor-router$/,
      replacement: essorRouterEntry,
    },
    {
      find: /^essor$/,
      replacement: essorClientEntry,
    },
    {
      find: /^essor\/server$/,
      replacement: isClient ? essorServerEntry : SSG_SERVER_PATH,
    },
    {
      find: /^essor-router$/,
      replacement: isClient ? essorRouterEntry : SSG_ROUTER_PATH,
    },
  ];
}

export function pluginConfig(
  config: SiteConfig,
  restartServer?: () => Promise<void>,
  isClient = true,
): Plugin {
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
            ...createRuntimeAliases(isClient),
            {
              find: '@theme',
              replacement: config.themeDir!,
            },
            {
              find: '@runtime',
              replacement: `${CLIENT_EXPORTS_PATH}`,
            },
            {
              find: '@shared',
              replacement: `${SHARED_PATH}`,
            },
            {
              find: '@theme-default',
              replacement: DEFAULT_THEME_PATH,
            },
          ],
        },
        build: {
          target: 'baseline-widely-available',
        },
      };
    },
    // Load virtual file
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        // "\0" is the convention for Vite to identify virtual files
        return `\0${SITE_DATA_ID}`;
      }
    },
    // Handle virtual file ID
    load(id) {
      if (id === `\0${SITE_DATA_ID}`) {
        // Return virtual file content
        return `export default ${JSON.stringify(config.siteData)}`;
      }
    },
    async handleHotUpdate(ctx) {
      const customWatchedFiles = [normalizePath(config.configPath!)];
      const include = (id: string) => customWatchedFiles.some(file => id.includes(file));

      if (include(ctx.file)) {
        console.log(`\n${relative(config.root, ctx.file)} changed, restarting server...`);
        await restartServer?.();
      }
    },
    configureServer(server) {
      const publicDir = join(config.root, 'public');
      server.middlewares.use(sirv(publicDir));
    },
  };
}
