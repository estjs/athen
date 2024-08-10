import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { type InlineConfig, build as viteBuild } from 'vite';
import fs, { copy } from 'fs-extra';
import { normalizeSlash, withBase } from '@/runtime';
import { version } from '../../package.json';
import { resolveConfig } from './config';
import { CLIENT_ENTRY_PATH, PACKAGE_ROOT, SERVER_ENTRY_PATH } from './constants';
import { createVitePlugins } from './plugins/';
import type { Router, SiteConfig } from '@/shared/types';
import type { RollupOutput } from 'rollup';
export function renderPage(
  render: any,
  root: string,
  clientBundle: RollupOutput,
  config: SiteConfig,
  routers: Required<Router>[],
) {
  const clientChunk = clientBundle.output.find(chunk => chunk.type === 'chunk' && chunk.isEntry);
  const cssChunk = clientBundle.output.filter(
    chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css'),
  );

  return Promise.all(
    routers.map(async route => {
      const routePath = route.path;

      const routeLoad = (await route.preload()) as any;
      const appHtml = render(routeLoad.default);

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset=utf-8>
          <meta http-equiv=X-UA-Compatible content="IE=edge">
          <meta name=viewport content="width=device-width,initial-scale=1">
          <title>${config.siteData!.title || 'Athen'}</title>
          <meta name="description" content="${version}">
          ${
            config.siteData!.head
              ? config
                  .siteData!.head.map(([key, value, content]) => {
                    if (typeof value === 'object') {
                      return `<${key} ${Object.entries(value).map(([k, v]) => `${k}="${v}"`)}>${content}</${key}>`;
                    } else {
                      return `<${key}>${content}</${key}>`;
                    }
                  })
                  .join('\n')
              : ''
          }
          <link rel="icon" href="${config.siteData!.icon}" type="image/svg+xml">
          ${cssChunk
            .map(item => `<link rel="stylesheet" href="${withBase(item.fileName)}">`)
            .join('\n')}
        </head>
        <body>
          <div id="app">${appHtml}</div>
          <script type="module" src="/${clientChunk?.fileName}"></script>
        </body>
      </html>`.trim();
      const normalizeHtmlFilePath = (path: string) => {
        const normalizedBase = normalizeSlash(root || '/');

        if (path.endsWith('/')) {
          path.slice(0, -1);
        }
        if (path.endsWith('/')) {
          return `${path}index.html`.replace(normalizedBase, '');
        }

        return `${path}.html`.replace(normalizedBase, '');
      };
      const fileName = normalizeHtmlFilePath(routePath);
      const distPath = join(root, 'build');
      console.log('dist path', distPath);
      console.log(html);

      await fs.ensureDir(join(distPath, dirname(fileName)));
      writeFileSync(join(distPath, fileName), html);
    }),
  );
}

export async function bundle(root: string, options) {
  const resolveViteConfig = async (isServer: boolean): Promise<InlineConfig> => {
    const plugins = await createVitePlugins(options, isServer);

    return {
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
        emptyOutDir: true,
        ssr: !isServer,
        outDir: isServer ? join(root, 'build') : join(root, '.temp'),
        rollupOptions: {
          input: isServer ? CLIENT_ENTRY_PATH : SERVER_ENTRY_PATH,
        },
      },
    };
  };

  try {
    const client = await viteBuild(await resolveViteConfig(false));
    const server = await viteBuild(await resolveViteConfig(true));

    return [client, server];
  } catch (error) {
    console.error(error);
  }
}
export async function build(root: string = process.cwd()) {
  const tempPath = join(root, '.temp');
  const distPath = join(root, 'build');
  fs.remove(tempPath);
  fs.remove(distPath);

  const config = await resolveConfig(root, 'build', 'production');
  const [client, server] = (await bundle(root, config)) as [RollupOutput, RollupOutput];

  console.log(JSON.stringify(client, null, 2));
  console.log(JSON.stringify(server, null, 2));

  const serverEntryPath = join(tempPath, 'ssg-entry.js');
  const fileUrl = pathToFileURL(serverEntryPath).href;

  const { render, routes } = await import(fileUrl);
  await renderPage(render, root, server, config, routes);
  const publicDirInRoot = join(root, 'public');
  await copy(publicDirInRoot, distPath);
  const indexHtml = await fs.readFile(`${root}/index.html`);
  await fs.writeFile(`${distPath}/index.html`, indexHtml);
}
