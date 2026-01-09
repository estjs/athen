import EnvironmentPlugin from 'vite-plugin-environment';
import pluginUnocss from 'unocss/vite';
import Inspect from 'vite-plugin-inspect';
import { pluginMdx } from '@athen/plugin-mdx';
import { pick } from 'lodash-es';
import pluginRoute from './router';
import unocssOptions from './unocss';
import { RouteService } from './router/routeService';
import { pluginMdxHMR } from './mdxHmr';
import { pluginAthen } from './athen';
import { pluginSvgr } from './svgr';
import type { SiteConfig } from '../../shared/types';
import type { Plugin, PluginOption } from 'vite';

export async function createVitePlugins(
  config: SiteConfig,
  isServer = true,
  restartServer?: () => Promise<void>,
) {
  // 1. Built-in plugins list
  const builtIn: PluginOption[] = [
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
  ];

  // Optional built-ins
  if (config?.search) {
    try {
      // Plugin may be missing if package removed
      const plugin = (await import('@athen/plugin-search')).default;
      builtIn.push(plugin());
    } catch (error) {
      console.warn('[athen] search plugin not found, skip.', error);
    }
  }

  if (config.analytics) {
    try {
      const plugin = (await import('@athen/plugin-analytics')).default;
      builtIn.push(plugin(config.analytics));
    } catch (error) {
      console.warn('[athen] analytics plugin not found, skip.', error);
    }
  }

  // Inspect plugin last
  builtIn.push(Inspect());

  const userPlugins: PluginOption[] = config.plugins || [];

  // Build set of user plugin names to support override logic
  const userPluginNames = new Set(
    userPlugins
      .map(p => {
        if (!p) return undefined;
        if (typeof p === 'function') return undefined;
        const plg = p as Partial<Plugin>;
        return plg.name;
      })
      .filter(Boolean) as string[],
  );

  // Filter built-ins whose names are overridden
  const finalBuiltIn = builtIn.filter(p => {
    if (!p) return false;
    if (typeof p === 'function') return true;
    const name = (p as Plugin).name;
    return !userPluginNames.has(name);
  });

  // Return order: user plugins first (can enforce 'pre'), then built-ins, finally any user plugins with enforce 'post'
  // Simplify: just concat userPlugins + filtered builtIns (Vite runs in array order)
  return [...userPlugins, ...finalBuiltIn];
}
