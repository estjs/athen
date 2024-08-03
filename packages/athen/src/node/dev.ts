import { resolve } from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
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
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'load-js-files-as-jsx',
            setup(build) {
              build.onLoad({ filter: /.*\.js$/ }, async args => ({
                loader: 'jsx',
                contents: await fs.readFile(args.path, 'utf8'),
              }));
            },
          },
        ],
      },
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
