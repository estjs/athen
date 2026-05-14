import { resolve } from 'node:path';
import process from 'node:process';
import { createServer, mergeConfig } from 'vite';
import { resolveConfig } from './config';
import { createVitePlugins } from './plugins';
import { PACKAGE_ROOT } from './constants';

export async function createDevServer(
  root: string = process.cwd(),
  port?: number,
  host?: string | boolean,
  restartServer?: () => Promise<void>,
) {
  const config = await resolveConfig(root, 'serve', 'development');

  const defaultConfig = {
    configFile: false,
    root,
    base: config.siteData.base || '/',
    resolve: {
      alias: {
        '@': resolve(PACKAGE_ROOT, 'src'),
      },
    },
    esbuild: {
      jsx: 'preserve',
    },
    plugins: await createVitePlugins(config, true, restartServer),
    server: {
      port: port || 8730,
      host: host,
      fs: {
        allow: [PACKAGE_ROOT],
      },
    },
    build: {
      target: 'baseline-widely-available',
    },
  };

  return createServer(mergeConfig(config.vite || {}, defaultConfig));
}
