import { pluginMdxEssor } from './pluginMdxEssor';
import { pluginMdxGit } from './pluginMdxLastUpdated';
import { pluginMdxRawContent } from './pluginMdxRawContent';
import { pluginMdxRollup } from './pluginMdxRollup';
import { defaultConfig } from './utils';
import type { options } from './types';
import type { Plugin } from 'vite';

export async function pluginMdx(config: options): Promise<Plugin<any>[]> {
  config = { ...defaultConfig, ...config };
  return [
    await pluginMdxRollup(config),
    config.essor && pluginMdxEssor(),
    pluginMdxGit(),
    pluginMdxRawContent(),
    ...(config.plugins || []),
  ].filter(Boolean) as Plugin[];
}
