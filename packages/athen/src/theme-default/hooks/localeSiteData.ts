import { normalizeSlash, withBase } from '../../shared/utils';
import type { DefaultTheme } from '../../shared/types';

function createGlobalLocaleDefaults(themeConfig: DefaultTheme.Config): DefaultTheme.LocaleConfig {
  return {
    label: '',
    title: themeConfig.siteTitle,
    nav: themeConfig.nav,
    sidebar: themeConfig.sidebar as DefaultTheme.Sidebar,
    outlineTitle: themeConfig.outlineTitle,
    lastUpdatedText: themeConfig.lastUpdatedText,
    editLink: themeConfig.editLink,
    prevPageText: themeConfig.prevPageText,
    nextPageText: themeConfig.nextPageText,
  };
}

function resolveLocaleKey(
  locales: NonNullable<DefaultTheme.Config['locales']>,
  pathname: string,
  base = '/',
) {
  const localeKeys = Object.keys(locales).sort(
    (a, b) => normalizeSlash(b).length - normalizeSlash(a).length,
  );

  return (
    localeKeys.find((locale) => {
      const normalizedLocalePrefix = withBase(normalizeSlash(locale), base);
      return (pathname || '/').startsWith(normalizedLocalePrefix);
    }) || localeKeys[0]
  );
}

export function resolveLocaleSiteData(
  themeConfig: DefaultTheme.Config,
  pathname: string,
  base = '/',
): DefaultTheme.LocaleConfig {
  const globalDefaults = createGlobalLocaleDefaults(themeConfig);
  const locales = themeConfig.locales;

  if (!locales || Object.keys(locales).length === 0) {
    return globalDefaults;
  }

  const localeKey = resolveLocaleKey(locales, pathname, base);

  return {
    ...globalDefaults,
    ...locales[localeKey],
    langRoutePrefix: localeKey,
  };
}
