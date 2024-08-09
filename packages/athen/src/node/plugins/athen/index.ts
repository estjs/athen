import { pluginConfig } from './config';
import { pluginIndexHtml } from './indexHtml';
import { pluginSiteData } from './siteData';
import { pluginTransform } from './transform';
import type { SiteConfig } from '../../../shared/types';
import type { Plugin } from 'vite';

export function pluginAthen(
  config: SiteConfig,
  isServer = false,
  restartServer?: () => Promise<void>,
): Plugin[] {
  return [
    pluginSiteData(config),
    pluginConfig(config, restartServer),
    pluginIndexHtml(config),
    pluginTransform(isServer),
  ];
}
