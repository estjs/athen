import babel from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import { MD_REGEX, TS_REGEX } from '../constants';
import { RouteService } from './router/routeService';
import type { SiteConfig } from '../../shared/types';
import type { Plugin } from 'vite';

export function pluginMdxHMR(config: SiteConfig, isServer): Plugin {
  return {
    name: 'vite-plugin-mdx-hmr',
    apply: 'serve',

    transform(code, id, opts) {
      if (MD_REGEX.test(id) || TS_REGEX.test(id)) {
        const result = babel.transformSync(code, {
          filename: `${id}`,
          sourceType: 'module',
          plugins: [[BabelPluginEssor, { ...opts, ssg: !isServer }]],
        });
        const selfAcceptCode = 'import.meta.hot.accept();';
        if (typeof result === 'object' && !result!.code?.includes(selfAcceptCode)) {
          result!.code += selfAcceptCode;
        }
        return result;
      }
    },
    handleHotUpdate(ctx) {
      if (/\.mdx?/.test(ctx.file)) {
        const routePath = RouteService.getRoutePathFromFile(
          ctx.file,
          config.root,
          config.base || '/',
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
