import { join, relative } from 'node:path';
import { type Plugin, normalizePath } from 'vite';
import sirv from 'sirv';
import {
  CLIENT_EXPORTS_PATH,
  DEFAULT_THEME_PATH,
  PACKAGE_ROOT,
  SHARED_PATH,
} from '../../constants';
import type { SiteConfig } from '@shared/types';

const SITE_DATA_ID = 'athen:site-data';

export function pluginConfig(config: SiteConfig, restartServer?: () => Promise<void>): Plugin {
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
          alias: {
            '@theme': config.themeDir!,
            '@runtime': `${CLIENT_EXPORTS_PATH}`,
            '@shared': `${SHARED_PATH}`,
            '@theme-default': DEFAULT_THEME_PATH,
          },
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
