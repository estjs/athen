import { RouteService } from './routeService';
import type { PluginOptions, UserConfig } from '@/shared/types';
import type { Plugin } from 'vite';

export const CONVENTIONAL_ROUTE_ID = 'athen:routes';

export default function pluginRoute(options: PluginOptions, siteData?: UserConfig): Plugin {
  const routeService = new RouteService(options.root);
  return {
    name: 'athen:routes',
    async configResolved() {
      // init router
      await routeService.init();
    },
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return `\0${CONVENTIONAL_ROUTE_ID}`;
      }
    },
    load(id) {
      if (id === `\0${CONVENTIONAL_ROUTE_ID}`) {
        const res = routeService.generateRoutesCode(siteData);
        return res;
      }
    },
  };
}
