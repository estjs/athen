import { RouteService } from './routeService';
import type { UserConfig } from '@/shared/types';
import type { Plugin } from 'vite';

type Component = () => JSX.Element;
export interface Meta {
  name?: string;
}
export interface Router {
  path: string;
  component: Component;
  meta?: Meta;
  preload?: (base: string) => Promise<Component>;
}

interface PluginOptions {
  root: string;
}

export const CONVENTIONAL_ROUTE_ID = 'athen:routes';

export default function pluginRoute(options: PluginOptions, siteData?: UserConfig): Plugin {
  const routeService = new RouteService(options.root);
  return {
    name: 'athen:plugin-routers',
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
