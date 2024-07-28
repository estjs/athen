import { resolve } from 'node:path';
import { createServer } from 'vite';
import { resolveConfig } from './config';
import { createVitePlugins } from './plugins';
import { PACKAGE_ROOT } from './constants';

export async function createDevServer(root: string, restartServer: () => Promise<void>) {
  const config = await resolveConfig(root, 'serve', 'development');
  return createServer({
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
      port: 1554,
      fs: {
        allow: [PACKAGE_ROOT],
      },
    },
  });
}
