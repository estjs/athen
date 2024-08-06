import { resolve } from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';
import { resolveConfig } from './config';
import { createVitePlugins } from './plugins';
import { PACKAGE_ROOT } from './constants';

export async function createDevServer(
  root: string = process.cwd(),
  restartServer: () => Promise<void>,
) {
  const config = await resolveConfig(root, 'serve', 'development');

  return createServer({
    configFile: false,
    root,
    base: '/',
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
      port: 8730,
      fs: {
        allow: [PACKAGE_ROOT],
      },
    },
  });
}
