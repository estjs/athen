import process from 'node:process';
import { resolve } from 'node:path';
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

  const devConfig = mergeConfig(
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
      configFile: false,
      base: config.siteData.base || '/',
      plugins: await createVitePlugins(config, true, restartServer),
      server: {
        port: port || 8730,
        host,
        fs: { allow: [PACKAGE_ROOT] },
      },
    },
  );

  return createServer(mergeConfig(config.vite || {}, devConfig));
}
