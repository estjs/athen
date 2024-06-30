import { pluginMdxGit } from './pluginMdxLastUpdated';
import { pluginMdxRawContent } from './pluginMdxRawContent';
import { pluginMdxRollup } from './pluginMdxRollup';
import type { options } from './types';
import type { Plugin } from 'vite';

export async function pluginMdx(config: options): Promise<Plugin[]> {
  return [
    await pluginMdxRollup(config),
    pluginMdxGit(),
    pluginMdxRawContent(),
    ...(config.plugins || []),
  ];
}
