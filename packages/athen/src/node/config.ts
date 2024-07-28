import { resolve } from 'node:path';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import type { SiteConfig, UserConfig } from '../shared/types';
type RawConfig = UserConfig | Promise<UserConfig> | (() => UserConfig | Promise<UserConfig>);
// import {isFn,isAsyncFn} from "@estjs/tools"

function getUserConfigForPath(root: string) {
  try {
    // support load config file
    const configFilePattern = /^athen.config\.(?:ts|js|mjs|cjs)$/;

    const files = fs.readdirSync(root);

    const configFile = files.find(file => configFilePattern.test(file))!;

    return resolve(root, configFile);
  } catch (error) {
    console.error(`Failed to load user config: ${error}`);
    throw error;
  }
}

async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production',
) {
  const configPath = (await getUserConfigForPath(root)) as string;

  const configResult = await loadConfigFromFile({ command, mode }, configPath, root);

  if (configResult) {
    const { config: rawConfig = {} as RawConfig } = configResult;

    // const userConfig = isAsyncFn(rawConfig) ? await rawConfig():isFn(rawConfig) ? rawConfig():rawConfig;
    const userConfig = await (typeof rawConfig === 'function' ? rawConfig() : rawConfig);

    return [configPath, userConfig] as const;
  }

  return [configPath, {} as UserConfig] as const;
}

// set default data
export function resolveSiteData(userConfig: UserConfig): UserConfig {
  return {
    title: userConfig.title || 'Athen',
    description: userConfig.description || '',
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {},
  };
}
export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production',
): Promise<SiteConfig> {
  const [configPath, userConfig] = await resolveUserConfig(root, command, mode);
  const siteConfig = {
    root,
    configPath,
    siteData: resolveSiteData(userConfig as UserConfig),
  };
  return siteConfig as SiteConfig;
}

export function defineConfig(config: UserConfig) {
  return config;
}
