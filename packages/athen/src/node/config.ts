import { dirname, isAbsolute, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { LOCALE_PREFERENCE_KEY } from '../shared/constants';
import {
  type LocaleRedirectEntry,
  getLocaleRedirectEntries,
  hasRootLocale,
  normalizeLanguageTag,
  normalizeLocalePrefix,
} from '../shared/locale';
import { normalizePublicRoute } from '../shared/utils';
import { DEFAULT_THEME_PATH } from './constants';
import { collectRouteMeta } from './plugins/router/routeService';
import { createAutoSidebar, hasAutoSidebar, resolveSidebar } from './sidebar';
import type {
  BrokenLinksBehavior,
  DefaultTheme,
  HeadConfig,
  RouteOptions,
  SiteConfig,
  SiteData,
  ThemeUserConfig,
  UserConfig,
} from '../shared/types';

type ThemeConfigWithLocales = Omit<DefaultTheme.Config, 'locales'> & {
  locales?: Record<string, unknown>;
};
type ConfigWithLocales = UserConfig<ThemeConfigWithLocales>;
type RawConfig =
  | ConfigWithLocales
  | Promise<ConfigWithLocales>
  | (() => ConfigWithLocales | Promise<ConfigWithLocales>);
type ResolvedLocaleConfig = ConfigWithLocales & { themeConfig: ThemeConfigWithLocales };

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
  const normalizedEntries = localeEntries.map((entry) => ({
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

function isThemeOptions(
  theme: ConfigWithLocales['theme'],
): theme is ThemeUserConfig<ThemeConfigWithLocales> {
  return Boolean(theme && typeof theme === 'object');
}

function resolveThemePackage(userConfig: ConfigWithLocales): string | undefined {
  if (typeof userConfig.theme === 'string') {
    return userConfig.theme;
  }
  if (isThemeOptions(userConfig.theme)) {
    return userConfig.theme.name ?? userConfig.theme.path;
  }
}

function resolveBase(userConfig: ConfigWithLocales): string {
  return userConfig.base ?? userConfig.site?.base ?? '';
}

function normalizeLocaleLookupKey(prefix: string) {
  const normalizedPrefix = normalizeLocalePrefix(prefix);
  return normalizedPrefix ? `/${normalizedPrefix}/` : '/';
}

function resolveDefaultLocaleConfig(userConfig: ConfigWithLocales) {
  const locales = userConfig.locales ?? userConfig.i18n?.locales;
  const defaultLocale = userConfig.defaultLocale ?? userConfig.i18n?.defaultLocale;
  if (!locales || !defaultLocale) {
    return undefined;
  }

  const normalizedDefaultLocale = normalizeLocaleLookupKey(defaultLocale);
  const normalizedDefaultLanguage = normalizeLanguageTag(defaultLocale);
  const routeLocale = Object.entries(locales).find(([prefix]) => {
    return normalizeLocaleLookupKey(prefix) === normalizedDefaultLocale;
  })?.[1];

  if (routeLocale) {
    return routeLocale;
  }

  return Object.values(locales).find((locale) => {
    const localeLanguage = normalizeLanguageTag(locale?.lang);
    return (
      localeLanguage === normalizedDefaultLanguage ||
      localeLanguage.split('-')[0] === normalizedDefaultLanguage
    );
  });
}

function resolveLang(userConfig: ConfigWithLocales): string {
  return (
    userConfig.lang ??
    resolveDefaultLocaleConfig(userConfig)?.lang ??
    userConfig.site?.lang ??
    'en-US'
  );
}

function resolveThemeConfig(userConfig: ConfigWithLocales): ThemeConfigWithLocales {
  const themeOptions = isThemeOptions(userConfig.theme) ? userConfig.theme : undefined;
  const themeConfig = {
    ...(themeOptions?.config || {}),
    ...(userConfig.themeConfig || {}),
  } as ThemeConfigWithLocales;

  if (themeOptions?.nav && themeConfig.nav === undefined) {
    themeConfig.nav = themeOptions.nav;
  }
  if (themeOptions?.sidebar && themeConfig.sidebar === undefined) {
    themeConfig.sidebar = themeOptions.sidebar;
  }
  if (themeOptions?.socialLinks && themeConfig.links === undefined) {
    themeConfig.links = themeOptions.socialLinks;
  }
  const editUrl = userConfig.editUrl ?? userConfig.docs?.editUrl;
  const editLink = userConfig.editLink ?? userConfig.docs?.editLink;

  if (editUrl && !themeConfig.editLink) {
    themeConfig.editLink = {
      pattern: editUrl,
    };
  }
  if (editLink) {
    themeConfig.editLink = editLink;
  }
  if (userConfig.locales ?? userConfig.i18n?.locales) {
    themeConfig.locales = userConfig.locales ?? userConfig.i18n?.locales;
  }

  return themeConfig;
}

function createLocaleAwareConfig(
  userConfig: ConfigWithLocales,
  themeConfig = resolveThemeConfig(userConfig),
): ResolvedLocaleConfig {
  return {
    ...userConfig,
    base: resolveBase(userConfig),
    lang: resolveLang(userConfig),
    themeConfig,
  };
}

function resolveSiteHead(
  userConfig: ConfigWithLocales,
  localeAwareConfig: ResolvedLocaleConfig,
): HeadConfig[] {
  const head: HeadConfig[] = [...(userConfig.head ?? userConfig.site?.head ?? [])];

  if (userConfig.colorScheme ?? userConfig.site?.colorScheme ?? true) {
    head.push(createDarkModeScript());
  }

  const languageRedirectScript =
    userConfig.i18n?.redirect === false ? null : createLanguageRedirectScript(localeAwareConfig);
  if (languageRedirectScript) {
    head.push(languageRedirectScript);
  }

  return head;
}

function resolveRoute(userConfig: ConfigWithLocales): RouteOptions | undefined {
  const docs = userConfig.docs;
  const route: RouteOptions = { ...(userConfig.route || {}) };

  const srcDir = userConfig.srcDir ?? docs?.srcDir;
  const routeBasePath = userConfig.routeBasePath ?? docs?.routeBasePath;
  const include = userConfig.include ?? docs?.include;
  const exclude = userConfig.exclude ?? docs?.exclude;
  const extensions = userConfig.extensions ?? docs?.extensions;
  const cleanUrls = userConfig.cleanUrls ?? docs?.cleanUrls;
  const trailingSlash = userConfig.trailingSlash ?? docs?.trailingSlash;
  const rewrites = userConfig.rewrites ?? docs?.rewrites;

  if (srcDir) {
    route.root = srcDir;
  }
  if (routeBasePath) {
    route.prefix = routeBasePath;
  }
  if (include) {
    route.include = include;
  }
  if (exclude) {
    route.exclude = exclude;
  }
  if (extensions) {
    route.extensions = extensions;
  }
  if (cleanUrls !== undefined) {
    route.cleanUrls = cleanUrls;
  }
  if (trailingSlash !== undefined) {
    route.trailingSlash = trailingSlash;
  }
  if (rewrites) {
    route.rewrites = rewrites;
  }

  return Object.keys(route).length ? route : undefined;
}

function resolveOnBrokenLinks(userConfig: ConfigWithLocales): BrokenLinksBehavior | undefined {
  return userConfig.onBrokenLinks ?? userConfig.docs?.onBrokenLinks;
}

function resolveAllowDeadLinks(userConfig: ConfigWithLocales): boolean | undefined {
  const onBrokenLinks = resolveOnBrokenLinks(userConfig);
  if (onBrokenLinks === 'throw') {
    return false;
  }
  if (onBrokenLinks === 'warn' || onBrokenLinks === 'ignore') {
    return true;
  }
  return userConfig.allowDeadLinks;
}

function resolveAutoSidebar(
  root: string,
  siteData: SiteData<ThemeConfigWithLocales>,
  route?: RouteOptions,
  srcDir?: string,
) {
  const sidebar = siteData.themeConfig.sidebar;
  const locales = siteData.themeConfig.locales as
    | Record<string, DefaultTheme.LocaleConfig>
    | undefined;
  const hasLocaleAutoSidebar =
    locales && Object.values(locales).some((locale) => hasAutoSidebar(locale.themeConfig?.sidebar));

  if (!hasAutoSidebar(sidebar) && !hasLocaleAutoSidebar) {
    return;
  }

  const scanDir = join(root, route?.root || srcDir || '');
  const routes = collectRouteMeta(scanDir, route, siteData);

  if (hasAutoSidebar(sidebar)) {
    siteData.themeConfig.sidebar = resolveSidebar(routes, sidebar as DefaultTheme.SidebarConfig);
  }

  if (!locales) {
    return;
  }

  const nonRootLocalePrefixes = Object.keys(locales)
    .map((prefix) => normalizePublicRoute(prefix, { trailingSlash: true }))
    .filter((prefix) => prefix !== '/');

  for (const [prefix, locale] of Object.entries(locales)) {
    const localeSidebar = locale.themeConfig?.sidebar;
    if (!hasAutoSidebar(localeSidebar)) {
      continue;
    }

    const normalizedPrefix = normalizePublicRoute(prefix, { trailingSlash: true });
    const excludePrefixes = normalizedPrefix === '/' ? nonRootLocalePrefixes : [];

    locale.themeConfig = {
      ...locale.themeConfig,
      sidebar:
        localeSidebar === 'auto'
          ? createAutoSidebar(routes, prefix, excludePrefixes)
          : resolveSidebar(routes, localeSidebar as DefaultTheme.SidebarConfig),
    };
  }
}

function createLanguageRedirectScript(userConfig: ConfigWithLocales): HeadConfig | null {
  const localeEntries = getLocaleRedirectEntries(userConfig);
  const rootLocale =
    hasRootLocale(userConfig) ||
    localeEntries.some((entry) => normalizeLocalePrefix(entry.prefix) === '');
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

export function resolveSiteData(root: string, userConfig: ConfigWithLocales = {}): SiteData {
  const themeConfig = resolveThemeConfig(userConfig);
  const localeAwareConfig = createLocaleAwareConfig(userConfig, themeConfig);

  return {
    lang: localeAwareConfig.lang || 'en-US',
    title: userConfig.title ?? userConfig.site?.title ?? 'Athen',
    description: userConfig.description ?? userConfig.site?.description ?? 'Athen',
    themeConfig,
    head: resolveSiteHead(userConfig, localeAwareConfig),
    base: localeAwareConfig.base || '',
    icon:
      userConfig.favicon ??
      userConfig.icon ??
      userConfig.site?.favicon ??
      userConfig.site?.icon ??
      '',
    root,
    colorScheme: userConfig.colorScheme ?? userConfig.site?.colorScheme ?? true,
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
  const theme = resolveThemePackage(userConfig);

  if (theme) {
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

  const route = resolveRoute(userConfig);
  const siteData = resolveSiteData(root, userConfig) as SiteData<ThemeConfigWithLocales>;
  const srcDir = userConfig.srcDir ?? userConfig.docs?.srcDir;
  resolveAutoSidebar(root, siteData, route, srcDir);

  return {
    root,
    configPath,
    themeDir,
    siteData,
    search: userConfig.search,
    analytics: userConfig.analytics,
    plugins: userConfig.plugins,
    instances: userConfig.instances,
    vite: userConfig.vite,
    route,
    markdown: userConfig.markdown,
    cleanUrls: userConfig.cleanUrls ?? userConfig.docs?.cleanUrls,
    trailingSlash: userConfig.trailingSlash ?? userConfig.docs?.trailingSlash,
    rewrites: userConfig.rewrites ?? userConfig.docs?.rewrites,
    outDir: userConfig.outDir ?? userConfig.docs?.outDir,
    tempDir: userConfig.tempDir ?? userConfig.docs?.tempDir,
    enableSpa: userConfig.enableSpa ?? userConfig.docs?.enableSpa,
    onBrokenLinks: resolveOnBrokenLinks(userConfig),
    allowDeadLinks: resolveAllowDeadLinks(userConfig),
    srcDir,
  };
}

export function defineConfig<ThemeConfig = DefaultTheme.Config>(config: UserConfig<ThemeConfig>) {
  return config;
}
