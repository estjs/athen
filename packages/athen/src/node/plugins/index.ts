import EnvironmentPlugin from 'vite-plugin-environment';
import pluginUnocss from 'unocss/vite';
import Inspect from 'vite-plugin-inspect';
import { pluginMdx } from 'plugins-mdx';
import { pick } from 'lodash-es';
import pluginRoute from './router';
import unocssOptions from './unocss';
import { RouteService } from './router/routeService';
import { pluginMdxHMR } from './mdxHmr';
import { pluginAthen } from './athen';
import { pluginSvgr } from './svgr';
import type { SiteConfig } from '../../shared/types';

export async function createVitePlugins(
  config: SiteConfig,
  isServer = true,
  restartServer?: () => Promise<void>,
) {
  return [
    await pluginMdx({
      ...pick(config, ['root', 'base']),
      RouteService,
      plugins: [pluginMdxHMR(config, isServer)],
    }),
    pluginUnocss(unocssOptions),
    EnvironmentPlugin([]),
    pluginAthen(config, isServer, restartServer),
    pluginRoute({ root: config.root }, config.siteData),
    pluginSvgr({}, isServer),
    Inspect(),
  ];
}
