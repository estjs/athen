import { resolve } from 'node:path';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import type { DefaultTheme, HeadConfig, SiteConfig, SiteData, UserConfig } from '../shared/types';
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

function resolveSiteDataHead(userConfig?: UserConfig): HeadConfig[] {
  const head = userConfig?.head ?? [];

  // add inline script to apply dark mode, if user enables the feature.
  // this is required to prevent "flush" on initial page load.
  if (userConfig?.appearance ?? true) {
    head.push([
      'script',
      { id: 'check-dark-light' },
      `
        ;(() => {
          const saved = localStorage.getItem('color-schema')
          const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (!saved || saved === 'auto' ? prefereDark : saved === 'dark') {
            document.documentElement.classList.add('dark')
          }
        })()
      `,
    ]);
  }

  return head;
}

// set default data
export function resolveSiteData(
  root: string,
  userConfig: UserConfig,
): SiteData<DefaultTheme.Config> {
  return {
    lang: userConfig.lang || 'en-US',
    title: userConfig.title || 'Athen',
    description: userConfig.description || 'Athen',
    themeConfig: userConfig.themeConfig || {},
    head: resolveSiteDataHead(userConfig),
    base: userConfig.base || '',
    icon: userConfig.icon || '',
    root,
    colorScheme: userConfig.colorScheme ?? true,
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
    siteData: resolveSiteData(root, userConfig as UserConfig),
  };
  return siteConfig as SiteConfig;
}

export function defineConfig(config: UserConfig) {
  return config;
}
