import { createRequire } from 'node:module';
import EnvironmentPlugin from 'vite-plugin-environment';
import { presetWind3 } from 'unocss';
import pluginUnocss from 'unocss/vite';
import presetIcons from '@unocss/preset-icons/browser';
import Inspect from 'vite-plugin-inspect';
import { pluginMdx } from '@estjs/athen-plugin-mdx';
import searchPlugin from '@estjs/athen-plugin-search';
import analyticsPlugin from '@estjs/athen-plugin-analytics';
import { getDefaultLocalePrefix } from '../routes';
import { pluginAthen, pluginRoute } from './core';
import { pluginMdxHMR } from './mdxHmr';
import { pluginSvgr } from './svgr';
import type { VitePluginConfig } from 'unocss/vite';
import type { SiteConfig } from '../../shared/types';
import type { Plugin, PluginOption } from 'vite';

const require = createRequire(import.meta.url);
const carbonIcons = require('@iconify-json/carbon/icons.json');

const unocssOptions: VitePluginConfig = {
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: { carbon: () => carbonIcons },
    }),
  ],
  theme: {
    colors: {
      brandLight: 'var(--at-c-brand-light)',
      brandDark: 'var(--at-c-brand-dark)',
      brand: 'var(--at-c-brand)',
      text: {
        1: 'var(--at-c-text-1)',
        2: 'var(--at-c-text-2)',
        3: 'var(--at-c-text-3)',
        4: 'var(--at-c-text-4)',
      },
      border: {
        default: 'var(--at-c-divider)',
        light: 'var(--at-c-divider-light)',
        dark: 'var(--at-c-divider-dark)',
      },
      gray: {
        light: {
          1: 'var(--at-c-gray-light-1)',
          2: 'var(--at-c-gray-light-2)',
          3: 'var(--at-c-gray-light-3)',
          4: 'var(--at-c-gray-light-4)',
        },
      },
      bg: {
        default: 'var(--at-c-bg)',
        soft: 'var(--at-c-bg-soft)',
        mute: 'var(--at-c-bg-mute)',
      },
    },
  },
};

function pluginName(p: PluginOption): string | undefined {
  if (!p || typeof p === 'function' || Array.isArray(p) || 'then' in (p as object)) return;
  return (p as Plugin).name;
}

/** Drop built-in plugins that the user has explicitly overridden by name. */
function dedupeByName(builtIn: PluginOption[], userPlugins: PluginOption[]): PluginOption[] {
  const overrides = new Set(userPlugins.map(pluginName).filter(Boolean) as string[]);
  return builtIn.filter((p) => {
    if (!p) return false;
    const name = pluginName(p);
    return !name || !overrides.has(name);
  });
}

export async function createVitePlugins(
  config: SiteConfig,
  isServer = false,
  restartServer?: () => Promise<void>,
) {
  const mdxOptions = {
    root: config.root,
    base: config.siteData.base,
    enableSpa: config.enableSpa,
    ...(config.markdown || {}),
    essor: true,
    plugins: [pluginMdxHMR(config, isServer) as never],
  } as Parameters<typeof pluginMdx>[0];

  const builtIn: PluginOption[] = [
    (await pluginMdx(mdxOptions)) as unknown as PluginOption,
    pluginUnocss(unocssOptions),
    EnvironmentPlugin([]),
    pluginAthen(config, isServer, restartServer),
    pluginRoute(config),
    pluginSvgr({}, isServer),
  ];

  if (config?.search) {
    const searchOptions = {
      ...(typeof config.search === 'object' ? config.search : {}),
      root: config.root,
      defaultLocaleSourcePrefix: getDefaultLocalePrefix(config.siteData),
    };
    builtIn.push(searchPlugin(searchOptions));
  }

  if (config.analytics) builtIn.push(analyticsPlugin(config.analytics));
  if (isServer) builtIn.push(Inspect());

  const userPlugins: PluginOption[] = config.plugins || [];
  return [...userPlugins, ...dedupeByName(builtIn, userPlugins)];
}
