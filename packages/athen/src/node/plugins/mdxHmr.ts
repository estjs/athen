import { join } from 'node:path';
import { transformSync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import { MD_REGEX, SX_REGEX } from '@/node/constants';
import { routeFromFilePath } from '@/node/routes';
import type { Plugin } from 'vite';
import type { SiteConfig } from '@/shared/types/index';

export function pluginMdxHMR(config: SiteConfig, isServer: boolean): Plugin {
  return {
    name: 'vite-plugin-mdx-hmr',
    apply: 'serve',

    transform(code, id) {
      if (MD_REGEX.test(id) || SX_REGEX.test(id)) {
        const result = transformSync(code, {
          filename: `${id}`,
          sourceType: 'module',
          plugins: [
            [BabelPluginEssor, { hmr: false, mode: isServer ? 'hydrate' : 'server' }],
          ],
        });
        const selfAcceptCode = 'import.meta.hot.accept();';
        if (typeof result === 'object' && !result!.code?.includes(selfAcceptCode)) {
          result!.code += selfAcceptCode;
        }
        return {
          code: result?.code ?? code,
          map: result?.map ?? undefined,
        };
      }
    },
    handleHotUpdate(ctx) {
      if (/\.mdx?/.test(ctx.file)) {
        const routePath = routeFromFilePath(
          ctx.file,
          join(config.root, config.route?.root || config.srcDir || ''),
          config.siteData.base || '/',
          config.siteData,
          config.route,
        );
        ctx.server.ws!.send({
          type: 'custom',
          event: 'md(x)-changed',
          data: {
            filePath: ctx.file,
            routePath,
          },
        });
      }
    },
  };
}
