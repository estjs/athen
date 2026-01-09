import { dirname, isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { DEFAULT_THEME_PATH } from './constants';
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

  const configResult = await loadConfigFromFile(
    {
      command,
      mode,
    },
    configPath,
    root,
  );

  if (configResult) {
    const { config: rawConfig = {} as RawConfig } = configResult;

    const userConfig = await (typeof rawConfig === 'function' ? rawConfig() : rawConfig);

    return [configPath, userConfig] as const;
  }

  return [configPath, {} as UserConfig] as const;
}

function resolveSiteDataHead(userConfig?: UserConfig<DefaultTheme.Config>): HeadConfig[] {
  const head = userConfig?.head ?? [];
  // add inline script to apply dark mode, if user enables the feature.
  // this is required to prevent "flush" on initial page load.
  if (userConfig?.colorScheme ?? true) {
    head.push([
      'script',
      { id: 'check-dark-light' },
      `
     ;(function () {
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const setting = localStorage.getItem('color-schema') || 'auto';
      if (setting === 'dark' || (prefersDark && setting !== 'light')) {
        document.documentElement.classList.toggle('dark', true);
      }
    })();
      `,
    ]);
  }
  if (userConfig?.langs || userConfig?.themeConfig?.locales) {
    head.push([
      'script',
      { id: 'check-lang' },
      `
        ;(() => {
            var base = '';
            const withBase = p => base + p;
            var langPrefixList = [withBase('/zh'), withBase('/en')];
            var isIncludeLangPrefix = langPrefixList.some(function (langPrefix) {
              return window.location.pathname.startsWith(langPrefix);
            });
            if (!isIncludeLangPrefix) {
              if (typeof window !== 'undefined' && window.navigator) {
                var langs = window.navigator.languages || [window.navigator.language]
                if (langs.some(function (lang) { return lang.includes('zh') })) {
                  window.location.href = withBase('/zh/');
                } else {
                  window.location.href = withBase('/en/');
                }
              } else {
                window.location.href = withBase('/zh/');
              }
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
  userConfig: UserConfig<DefaultTheme.Config>,
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

  // ------------------------------------------
  // Resolve theme directory
  // ------------------------------------------
  const require = createRequire(import.meta.url);
  let themeDir: string;
  if (userConfig && (userConfig as UserConfig).theme) {
    const theme = (userConfig as UserConfig).theme as string;
    if (isAbsolute(theme)) {
      themeDir = theme;
    } else {
      // Try to resolve as a Node.js package first. Fall back to path relative to project root.
      try {
        // `require.resolve` returns the entry file. We need its directory.
        // This works for packages that export their theme entry via package.json main/module.
        themeDir = dirname(require.resolve(theme, { paths: [root] }));
      } catch {
        themeDir = resolve(root, theme);
      }
    }
  } else {
    themeDir = DEFAULT_THEME_PATH;
  }

  const siteConfig = {
    root,
    configPath,
    siteData: resolveSiteData(root, userConfig as UserConfig<DefaultTheme.Config>),
    themeDir,
  };
  return siteConfig as SiteConfig;
}

export function defineConfig(config: UserConfig) {
  return config;
}
