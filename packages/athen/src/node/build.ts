import { join, resolve } from 'node:path';
import process from 'node:process';
import { writeFileSync } from 'node:fs';
import { type InlineConfig, build as viteBuild } from 'vite';
import fs, { copy } from 'fs-extra';
import { withBase } from '@/runtime';
import { version } from '../../package.json';
import { resolveConfig } from './config';
import { CLIENT_ENTRY_PATH, PACKAGE_ROOT } from './constants';
import { createVitePlugins } from './plugins/';
import type { SiteConfig } from '@/shared/types';
import type { RollupOutput } from 'rollup';
export async function renderPage(root: string, clientBundle: RollupOutput, config: SiteConfig) {
  const clientChunk = clientBundle.output.find(chunk => chunk.type === 'chunk' && chunk.isEntry);
  const cssChunk = clientBundle.output.filter(
    chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css'),
  );
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>title</title>
      <meta name="description" content="${version}">
      ${
        config.head
          ? config.head
              .map(([key, value]) => {
                if (typeof value === 'object') {
                  return `<${key} ${Object.entries(value).map(([k, v]) => `${k}="${v}"`)} />`;
                }
                return `<${key} />`;
              })
              .join('\n')
          : ''
      }
      <link rel="icon" href="${config.siteData!.icon}" type="image/svg+xml"></link>
            ${cssChunk
              .map(item => `<link rel="stylesheet" href="${withBase(item.fileName)}">`)
              .join('\n')}
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/${clientChunk?.fileName}"></script>
    </body>
  </html>`.trim();
  const distPath = join(root, 'build');
  await fs.ensureDir(distPath);
  writeFileSync(join(root, 'build/index.html'), html);
  // Copy public assets
  const publicDirInRoot = join(root, 'public');
  await copy(publicDirInRoot, distPath);
}

export async function bundle(root: string = process.cwd(), config) {
  const plugins = await createVitePlugins(config);
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

  const client = await viteBuild(viteConfig);
  return client;
}
export async function build(root: string = process.cwd()) {
  const config = await resolveConfig(root, 'build', 'production');
  const client = (await bundle(root, config)) as RollupOutput;

  await renderPage(root, client, config);
}
