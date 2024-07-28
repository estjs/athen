import { join, resolve } from 'node:path';
import process from 'node:process';
import { type InlineConfig, build as viteBuild } from 'vite';
import { resolveConfig } from './config';
import { CLIENT_ENTRY_PATH, PACKAGE_ROOT } from './constants';
import { createVitePlugins } from './plugins';

export async function build(root: string = process.cwd()) {
  const config = await resolveConfig(root, 'build', 'production');

  const plugins = await createVitePlugins(config, false);
  const viteConfig: InlineConfig = {
    mode: 'production',
    root,
    resolve: {
      alias: {
        '@': resolve(PACKAGE_ROOT, 'src'),
      },
    },
    plugins,
    esbuild: {
      jsx: 'preserve',
    },
    build: {
      outDir: join(root, 'build'),
      rollupOptions: {
        input: CLIENT_ENTRY_PATH,
      },
    },
  };

  await viteBuild(viteConfig);
}
