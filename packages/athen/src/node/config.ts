import { dirname, isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { DEFAULT_THEME_PATH } from './constants';
import type { DefaultTheme, HeadConfig, SiteConfig, SiteData, UserConfig } from '../shared/types';

type ConfigWithLocales = UserConfig<{ locales?: Record<string, unknown> }>;
type RawConfig =
  | ConfigWithLocales
  | Promise<ConfigWithLocales>
  | (() => ConfigWithLocales | Promise<ConfigWithLocales>);

function getUserConfigPath(root: string): string {
  const configFilePattern = /^athen\.config\.(?:ts|js|mjs|cjs)$/;
  const files = fs.readdirSync(root);
  const configFile = files.find(file => configFilePattern.test(file));

  if (!configFile) {
    throw new Error(`No athen config file found in ${root}`);
  }

  return resolve(root, configFile);
}

async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production',
): Promise<readonly [string, ConfigWithLocales]> {
  const configPath = getUserConfigPath(root);

  const configResult = await loadConfigFromFile({ command, mode }, configPath, root);

  if (configResult) {
    const { config: rawConfig = {} as RawConfig } = configResult;
    const userConfig = await (typeof rawConfig === 'function' ? rawConfig() : rawConfig);
    return [configPath, userConfig] as const;
  }

  return [configPath, {}] as const;
}

function resolveSiteDataHead(userConfig: ConfigWithLocales): HeadConfig[] {
  const head: HeadConfig[] = [...(userConfig.head ?? [])];

  // Inline script to apply dark mode before first paint (prevents flash).
  if (userConfig.colorScheme ?? true) {
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

  // Language redirect script — derive prefixes from actual config instead of hardcoding.
  const langPrefixes = getLangPrefixes(userConfig);
  if (langPrefixes.length > 0) {
    const zhLang = langPrefixes.find(l => l.includes('zh'));
    const fallbackLang = `/${langPrefixes[0]}/`;
    const zhRedirectLang = zhLang ? `/${zhLang}/` : fallbackLang;
    head.push([
      'script',
      { id: 'check-lang' },
      `
        ;(() => {
            var base = ${JSON.stringify(userConfig.base || '')};
            const withBase = p => base + p;
            var langPrefixList = ${JSON.stringify(langPrefixes)}.map(l => withBase('/' + l));
            var isIncludeLangPrefix = langPrefixList.some(function (langPrefix) {
              return window.location.pathname.startsWith(langPrefix);
            });
            if (!isIncludeLangPrefix) {
              if (typeof window !== 'undefined' && window.navigator) {
                var langs = window.navigator.languages || [window.navigator.language]
                if (langs.some(function (lang) { return lang.includes('zh') })) {
                  window.location.href = withBase(${JSON.stringify(zhRedirectLang)});
                } else {
                  window.location.href = withBase(${JSON.stringify(fallbackLang)});
                }
              } else {
                window.location.href = withBase(${JSON.stringify(fallbackLang)});
              }
            }
        })()
      `,
    ]);
  }

  return head;
}

/**
 * Extract language prefixes from `langs` array or `themeConfig.locales` keys.
 * Returns empty array when no i18n is configured.
 */
function getLangPrefixes(userConfig: ConfigWithLocales): string[] {
  if (userConfig.langs?.length) {
    return userConfig.langs;
  }
  const locales = userConfig.themeConfig?.locales;
  if (locales && Object.keys(locales).length > 0) {
    return Object.keys(locales).map(key => key.replace(/^\/|\/$/g, '')).filter(Boolean);
  }
  return [];
}

export function resolveSiteData(
  root: string,
  userConfig: ConfigWithLocales = {},
): SiteData {
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
    search: typeof userConfig.search === 'object' ? userConfig.search : undefined,
  };
}

export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production',
): Promise<SiteConfig> {
  const [configPath, userConfig] = await resolveUserConfig(root, command, mode);

  const require = createRequire(import.meta.url);
  let themeDir: string;

  if (userConfig.theme) {
    const theme = userConfig.theme;
    if (isAbsolute(theme)) {
      themeDir = theme;
    } else {
      try {
        themeDir = dirname(require.resolve(theme, { paths: [root] }));
      } catch {
        themeDir = resolve(root, theme);
      }
    }
  } else {
    themeDir = DEFAULT_THEME_PATH;
  }

  return {
    root,
    configPath,
    themeDir,
    siteData: resolveSiteData(root, userConfig),
    search: userConfig.search,
    analytics: userConfig.analytics,
    plugins: userConfig.plugins,
    instances: userConfig.instances,
    vite: userConfig.vite,
    route: userConfig.route,
    outDir: userConfig.outDir,
    tempDir: userConfig.tempDir,
    enableSpa: userConfig.enableSpa,
    allowDeadLinks: userConfig.allowDeadLinks,
    srcDir: userConfig.srcDir,
  };
}

export function defineConfig<ThemeConfig = DefaultTheme.Config>(config: UserConfig<ThemeConfig>) {
  return config;
}
