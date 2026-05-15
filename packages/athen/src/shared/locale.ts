type LocaleConfig = {
  lang?: string;
};

export type LocaleAwareConfig = {
  lang?: string;
  langs?: string[];
  themeConfig?: unknown;
};

export type LocaleRedirectEntry = {
  prefix: string;
  lang: string;
};

export function normalizeLocalePrefix(prefix = ''): string {
  return prefix.replaceAll(/^\/+|\/+$/g, '').toLowerCase();
}

export function normalizeLanguageTag(language = ''): string {
  return language.replaceAll('_', '-').trim().toLowerCase();
}

export function getLocaleConfigs(config?: LocaleAwareConfig): Record<string, LocaleConfig> | undefined {
  if (!config?.themeConfig || typeof config.themeConfig !== 'object') return;

  const locales = (config.themeConfig as { locales?: unknown }).locales;
  if (!locales || typeof locales !== 'object') return;

  return locales as Record<string, LocaleConfig>;
}

export function getLocaleRedirectEntries(config: LocaleAwareConfig): LocaleRedirectEntry[] {
  const localeConfigs = getLocaleConfigs(config);
  if (localeConfigs && Object.keys(localeConfigs).length > 0) {
    return Object.entries(localeConfigs).map(([prefix, locale]) => {
      const normalizedPrefix = normalizeLocalePrefix(prefix);
      return {
        prefix: normalizedPrefix,
        lang: normalizeLanguageTag(locale?.lang ?? normalizedPrefix),
      };
    });
  }

  return (config.langs ?? []).map((prefix) => {
    const normalizedPrefix = normalizeLocalePrefix(prefix);
    return {
      prefix: normalizedPrefix,
      lang: normalizeLanguageTag(normalizedPrefix),
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
    return normalizeSlash(routePrefix);
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
