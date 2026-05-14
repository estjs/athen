import { join } from 'node:path';
import { RouteService } from './routeService';
import type { SiteConfig } from '@/shared/types';
import type { Plugin } from 'vite';

export const CONVENTIONAL_ROUTE_ID = 'athen:routes';

export default function pluginRoute(config: SiteConfig): Plugin {
  const rootPath = join(config.root);
  const routeService = new RouteService(rootPath);
  return {
    name: 'athen:routes',
    async configResolved() {
      // init router
      await routeService.init(config.route, config.siteData);
    },
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return `\0${CONVENTIONAL_ROUTE_ID}`;
      }
    },
    load(id) {
      if (id === `\0${CONVENTIONAL_ROUTE_ID}`) {
        const res = routeService.generateRoutesCode(config.siteData);
        return res;
      }
    },
  };
}
