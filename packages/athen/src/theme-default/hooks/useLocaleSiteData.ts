import { useRoute } from 'essor-router';
import { normalizeSlash } from '@/shared/utils/index';
import { usePageData, withBase } from '@/runtime';
import type { DefaultTheme } from '@shared/types';

export function useLocaleSiteData(): DefaultTheme.LocaleConfig {
  const pageData = usePageData();
  const route = useRoute();
  const pathname = import.meta.env.SSR ? route.path : location.pathname;
  const themeConfig = pageData?.siteData?.themeConfig ?? {};
  const locales = themeConfig?.locales;
  if (!locales || Object.keys(locales).length === 0) {
    return {
      nav: themeConfig.nav,
      sidebar: themeConfig.sidebar,
      lastUpdatedText: themeConfig.lastUpdatedText,
      prevPageText: themeConfig.prevPageText,
      nextPageText: themeConfig.nextPageText,
    } as DefaultTheme.LocaleConfig;
  }
  const localeKeys = Object.keys(locales);
  const localeKey =
    localeKeys.find(locale => {
      const normalizedLocalePrefix = withBase(normalizeSlash(locale));
      return pathname.startsWith(normalizedLocalePrefix);
    }) || localeKeys[0];

  return {
    ...locales[localeKey],
    langRoutePrefix: localeKey,
  };
}
