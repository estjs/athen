import process from 'node:process';
import { resolve } from 'node:path';
import { createServer, mergeConfig } from 'vite';
import { resolveConfig } from './config';
import { createVitePlugins } from './plugins';
import { BROWSER_BUILD_TARGET, PACKAGE_ROOT } from './constants';

interface DevStartupInfo {
  root: string;
  command: string;
  urls: { local: string[]; network: string[] };
  siteTitle?: string;
}

export function formatDevStartupInfo({ root, command, urls, siteTitle }: DevStartupInfo) {
  const lines = ['✨ Athen dev server ready'];

  if (siteTitle) lines.push(`Site    ${siteTitle}`);
  lines.push(`Root    ${root}`, `Command ${command}`);
  if (urls.local.length > 0) lines.push(`Local   ${urls.local.join(', ')}`);
  if (urls.network.length > 0) lines.push(`Network ${urls.network.join(', ')}`);

  return lines.join('\n');
}

export async function createDevServer(
  root: string = process.cwd(),
  port?: number,
  host?: string | boolean,
  restartServer?: () => Promise<void>,
) {
  const config = await resolveConfig(root, 'serve', 'development');

  const vitePlugins = await createVitePlugins(config, true, restartServer);

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
        target: BROWSER_BUILD_TARGET,
      },
    },
    {
      configFile: false,
      base: config.siteData.base || '/',
      plugins: vitePlugins,
      server: {
        port: port || 8730,
        host,
        fs: { allow: [PACKAGE_ROOT] },
      },
    },
  );

  return createServer(mergeConfig(config.vite || {}, devConfig));
}
