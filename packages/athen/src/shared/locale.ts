import type { LocaleConfig } from './types';

export const LOCALE_PREFERENCE_KEY = 'athen-locale';

export type LocaleRedirectEntry = {
  prefix: string;
  lang: string;
};

/**
 * Minimal locale-aware shape. Accepts the user's `UserConfig` and the resolved
 * `SiteData` (both have `lang` and `locales` at top level after the flat-config
 * refactor).
 */
export interface LocaleAwareConfig {
  lang?: string;
  locales?: Record<string, LocaleConfig>;
}

export function normalizeLocalePrefix(prefix = ''): string {
  return prefix.replaceAll(/^\/+|\/+$/g, '').toLowerCase();
}

export function normalizeLanguageTag(language = ''): string {
  return language.replaceAll('_', '-').trim().toLowerCase();
}

export function getLocaleConfigs(
  config?: LocaleAwareConfig,
): Record<string, LocaleConfig> | undefined {
  const locales = config?.locales;
  if (!locales || typeof locales !== 'object') return;
  return locales;
}

export function getLocaleRedirectEntries(config: LocaleAwareConfig): LocaleRedirectEntry[] {
  const localeConfigs = getLocaleConfigs(config);
  if (!localeConfigs) return [];

  return Object.entries(localeConfigs).map(([prefix, locale]) => {
    const normalizedPrefix = normalizeLocalePrefix(prefix);
    return {
      prefix: normalizedPrefix,
      lang: normalizeLanguageTag(locale?.lang ?? normalizedPrefix),
    };
  });
}

export function hasRootLocale(config?: LocaleAwareConfig): boolean {
  const localeConfigs = getLocaleConfigs(config);
  if (!localeConfigs || Object.keys(localeConfigs).length === 0) return false;
  return Object.keys(localeConfigs).some((prefix) => normalizeLocalePrefix(prefix) === '');
}

function normalizeSlash(path: string): string {
  return `/${path.replaceAll('\\', '/').replaceAll(/^\/+|\/+$/g, '')}/`.replaceAll(/\/+/g, '/');
}

/**
 * If the root locale (`'/'`) lives in a language subdirectory (e.g. files
 * stored under `docs/en/...` but served at `/`), return that source prefix so
 * the router can strip it. For locales with explicit URL prefixes, returns
 * undefined.
 */
export function getDefaultLocaleSourcePrefix(config?: LocaleAwareConfig): string | undefined {
  const localeConfigs = getLocaleConfigs(config);
  if (!localeConfigs) return;

  const siteLanguage = normalizeLanguageTag(config?.lang);
  const localeEntry = Object.entries(localeConfigs).find(([, locale]) => {
    const localeLanguage = normalizeLanguageTag(locale?.lang);
    return Boolean(localeLanguage && siteLanguage && siteLanguage.startsWith(localeLanguage));
  });

  if (!localeEntry) return;

  const [routePrefix, locale] = localeEntry;
  if (normalizeSlash(routePrefix) !== '/') {
    return undefined;
  }

  const sourcePrefix = normalizeLanguageTag(locale?.lang || config?.lang).split('-')[0];
  return sourcePrefix ? `/${sourcePrefix}/` : undefined;
}

export function stripLocalePrefix(path: string, localePrefix?: string): string {
  const normalizedLocale = normalizeLocalePrefix(localePrefix);
  if (!normalizedLocale) return path;

  const localePath = `/${normalizedLocale}`;
  const lowerPath = path.toLowerCase();
  if (lowerPath === localePath || lowerPath === `${localePath}/`) {
    return '/';
  }

  if (lowerPath.startsWith(`${localePath}/`)) {
    return path.slice(localePath.length) || '/';
  }

  return path;
}
