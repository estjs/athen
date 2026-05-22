import EnvironmentPlugin from 'vite-plugin-environment';
import pluginUnocss from 'unocss/vite';
import Inspect from 'vite-plugin-inspect';
import { pluginMdx } from '@estjs/athen-plugin-mdx';
import searchPlugin from '@estjs/athen-plugin-search';
import analyticsPlugin from '@estjs/athen-plugin-analytics';

import pluginRoute from './router';
import { getDefaultLocalePrefix } from './router/routeService';
import unocssOptions from './unocss';
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
  const mdxOptions = {
    root: config.root,
    base: config.siteData.base,
    enableSpa: config.enableSpa,
    allowDeadLinks: config.allowDeadLinks,
    ...(config.markdown || {}),
    essor: true,
    plugins: [pluginMdxHMR(config, isServer) as never],
  } as Parameters<typeof pluginMdx>[0];

  // 1. Built-in plugins list
  const builtIn: PluginOption[] = [
    (await pluginMdx(mdxOptions)) as unknown as PluginOption,
    pluginUnocss(unocssOptions),
    EnvironmentPlugin([]),
    pluginAthen(config, isServer, restartServer),
    pluginRoute(config),
    pluginSvgr({}, isServer),
  ];

  // Optional built-ins
  if (config?.search) {
    const searchOptions =
      typeof config.search === 'boolean'
        ? { root: config.root, defaultLocaleSourcePrefix: getDefaultLocalePrefix(config.siteData) }
        : {
            ...config.search,
            root: config.root,
            defaultLocaleSourcePrefix: getDefaultLocalePrefix(config.siteData),
          };
    builtIn.push(searchPlugin(searchOptions));
  }

  if (config.analytics) {
    builtIn.push(analyticsPlugin(config.analytics));
  }

  if (isServer) {
    // Inspect plugin last
    builtIn.push(Inspect());
  }

  const userPlugins: PluginOption[] = config.plugins || [];

  // Build set of user plugin names to support override logic
  const userPluginNames = new Set(
    userPlugins
      .map((p) => {
        if (!p) return undefined;
        if (typeof p === 'function') return undefined;
        const plg = p as Partial<Plugin>;
        return plg.name;
      })
      .filter(Boolean) as string[],
  );

  // Filter built-ins whose names are overridden
  const finalBuiltIn = builtIn.filter((p) => {
    if (!p) return false;
    if (typeof p === 'function') return true;
    const name = (p as Plugin).name;
    return !userPluginNames.has(name);
  });

  // Return order: user plugins first (can enforce 'pre'), then built-ins, finally any user plugins with enforce 'post'
  // Simplify: just concat userPlugins + filtered builtIns (Vite runs in array order)
  return [...userPlugins, ...finalBuiltIn];
}
