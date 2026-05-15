import { dirname, isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { DEFAULT_THEME_PATH } from './constants';
import { LOCALE_PREFERENCE_KEY } from '../shared/constants';
import {
  getLocaleRedirectEntries,
  hasRootLocale,
  normalizeLanguageTag,
  normalizeLocalePrefix,
  type LocaleRedirectEntry,
} from '../shared/locale';
import type { DefaultTheme, HeadConfig, SiteConfig, SiteData, UserConfig } from '../shared/types';

type ConfigWithLocales = UserConfig<{ locales?: Record<string, unknown> }>;
type RawConfig =
  | ConfigWithLocales
  | Promise<ConfigWithLocales>
  | (() => ConfigWithLocales | Promise<ConfigWithLocales>);

const CONFIG_FILE_PATTERN = /^athen\.config\.(?:ts|js|mjs|cjs)$/;

function getUserConfigPath(root: string): string {
  const configFile = fs.readdirSync(root).find((file) => CONFIG_FILE_PATTERN.test(file));

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

function createDarkModeScript(): HeadConfig {
  return [
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
  ];
}

export function resolveLocaleRedirectTarget(
  preferredLanguages: string[],
  localeEntries: LocaleRedirectEntry[],
  storedLocalePrefix?: string,
): string | undefined {
  const normalizedEntries = localeEntries
    .map((entry) => ({
      prefix: normalizeLocalePrefix(entry.prefix),
      lang: normalizeLanguageTag(entry.lang || entry.prefix),
    }));

  if (normalizedEntries.length === 0) {
    return undefined;
  }

  if (storedLocalePrefix) {
    const normalizedStoredPrefix = normalizeLocalePrefix(storedLocalePrefix);
    const storedLocale = normalizedEntries.find((entry) => entry.prefix === normalizedStoredPrefix);
    if (storedLocale) {
      return storedLocale.prefix ? `/${storedLocale.prefix}/` : undefined;
    }
  }

  const hasRoot = normalizedEntries.some((entry) => entry.prefix === '');
  const redirectableEntries = normalizedEntries.filter((entry) => entry.prefix);
  if (hasRoot || redirectableEntries.length === 0) {
    return undefined;
  }

  const candidates = preferredLanguages.map(normalizeLanguageTag).filter(Boolean);

  for (const candidate of candidates) {
    const candidateBase = candidate.split('-')[0];
    const exactMatch = redirectableEntries.find((entry) => entry.lang === candidate);
    if (exactMatch) {
      return `/${exactMatch.prefix}/`;
    }

    const baseMatch = redirectableEntries.find((entry) => {
      const entryBase = entry.lang.split('-')[0];
      return entry.lang === candidateBase || entryBase === candidateBase;
    });
    if (baseMatch) {
      return `/${baseMatch.prefix}/`;
    }
  }

  return `/${redirectableEntries[0].prefix}/`;
}

function createLanguageRedirectScript(userConfig: ConfigWithLocales): HeadConfig | null {
  const localeEntries = getLocaleRedirectEntries(userConfig);
  const rootLocale =
    hasRootLocale(userConfig) || localeEntries.some((entry) => normalizeLocalePrefix(entry.prefix) === '');
  if (localeEntries.length === 0 || (rootLocale && localeEntries.length === 1)) {
    return null;
  }

  return [
    'script',
    { id: 'check-lang' },
    `
        ;(() => {
            var base = ${JSON.stringify(userConfig.base || '')};
            var localeEntries = ${JSON.stringify(localeEntries)};
            var localePreferenceKey = ${JSON.stringify(LOCALE_PREFERENCE_KEY)};
            var hasRootLocale = ${JSON.stringify(rootLocale)};
            var normalizePath = function (p) {
              return (p || '/').replace(/\\/+$/, '') || '/';
            };
            var normalizeLanguageTag = function (tag) {
              return (tag || '').replaceAll('_', '-').trim().toLowerCase();
            };
            var normalizeLocalePrefix = function (prefix) {
              return (prefix || '').replace(/^\\/+|\\/+$/g, '');
            };
            var pickLocaleRedirectTarget = function (preferredLanguages, entries) {
              var normalizedEntries = entries
                .map(function (entry) {
                  return {
                    prefix: normalizeLocalePrefix(entry.prefix),
                    lang: normalizeLanguageTag(entry.lang || entry.prefix),
                  };
                })
                .filter(function (entry) {
                  return entry.prefix;
                });
              if (!normalizedEntries.length) {
                return '';
              }
              var candidates = (preferredLanguages || [])
                .map(normalizeLanguageTag)
                .filter(Boolean);
              for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                var candidateBase = candidate.split('-')[0];
                var exactMatch = normalizedEntries.find(function (entry) {
                  return entry.lang === candidate;
                });
                if (exactMatch) {
                  return '/' + exactMatch.prefix + '/';
                }
                var baseMatch = normalizedEntries.find(function (entry) {
                  var entryBase = entry.lang.split('-')[0];
                  return entry.lang === candidateBase || entryBase === candidateBase;
                });
                if (baseMatch) {
                  return '/' + baseMatch.prefix + '/';
                }
              }
              return '/' + normalizedEntries[0].prefix + '/';
            };
            var withBase = function (p) {
              return base + p;
            };
            var isPathInPrefix = function (pathname, prefix) {
              if (prefix === '/') return pathname.startsWith('/');
              return pathname === prefix || pathname.startsWith(prefix + '/');
            };
            var currentPath = normalizePath(window.location.pathname);
            var localePrefixList = localeEntries
              .map(function (entry) {
                return normalizeLocalePrefix(entry.prefix);
              })
              .filter(Boolean)
              .map(function (prefix) {
                return normalizePath(withBase('/' + prefix));
              });
            var hasLocalePrefix = localePrefixList.some(function (localePrefix) {
              return isPathInPrefix(currentPath, localePrefix);
            });
            if (hasLocalePrefix) {
              return;
            }
            var storedLocalePrefix = '';
            try {
              storedLocalePrefix = normalizeLocalePrefix(localStorage.getItem(localePreferenceKey) || '');
            } catch (e) {}
            if (storedLocalePrefix) {
              var storedLocale = localeEntries.find(function (entry) {
                return normalizeLocalePrefix(entry.prefix) === storedLocalePrefix;
              });
              if (storedLocale) {
                window.location.href = withBase('/' + storedLocalePrefix + '/');
                return;
              }
            }
            if (hasRootLocale) {
              return;
            }
            var preferredLanguages = (window.navigator.languages || [window.navigator.language] || [])
              .map(normalizeLanguageTag)
              .filter(Boolean);
            var targetPrefix = pickLocaleRedirectTarget(preferredLanguages, localeEntries);
            if (targetPrefix) {
              window.location.href = withBase(targetPrefix);
            }
        })()
      `,
  ];
}

function resolveSiteDataHead(userConfig: ConfigWithLocales): HeadConfig[] {
  const head: HeadConfig[] = [...(userConfig.head ?? [])];

  if (userConfig.colorScheme ?? true) {
    head.push(createDarkModeScript());
  }

  const languageRedirectScript = createLanguageRedirectScript(userConfig);
  if (languageRedirectScript) {
    head.push(languageRedirectScript);
  }

  return head;
}

export function resolveSiteData(root: string, userConfig: ConfigWithLocales = {}): SiteData {
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
