import { computed } from 'essor';
import { normalizeSlash } from '@/shared/utils/index';
import { usePageData, withBase } from '@/runtime';
import { usePathname } from './usePathname';
import { getLocalePath } from './localePath';
import type { DefaultTheme } from '@shared/types';

export { getLocalePath };

export function useLocaleSiteData() {
  const pageData = usePageData();
  const pathname = usePathname();

  return computed(() => {
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
    const localeKeys = Object.keys(locales).sort(
      (a, b) => normalizeSlash(b).length - normalizeSlash(a).length,
    );
    const localeKey =
      localeKeys.find(locale => {
        const normalizedLocalePrefix = withBase(normalizeSlash(locale));
        return (pathname.value || '/').startsWith(normalizedLocalePrefix);
      }) || localeKeys[0];

    return {
      ...locales[localeKey],
      langRoutePrefix: localeKey,
    };
  });
}
