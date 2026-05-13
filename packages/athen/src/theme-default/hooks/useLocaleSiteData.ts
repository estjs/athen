import { computed } from 'essor';
import { normalizeSlash } from '@/shared/utils/index';
import { usePageData, withBase } from '@/runtime';
import { usePathname } from './usePathname';
import type { DefaultTheme } from '@shared/types';

export function getLocalePath(
  pathname = '/',
  targetLocalePrefix = '/',
  localePrefixes: string[] = [],
) {
  const normalizedTargetPrefix = normalizeSlash(targetLocalePrefix);
  const normalizedPathname = normalizeSlash(pathname);
  const sourceLocalePrefix = localePrefixes
    .map(locale => normalizeSlash(locale))
    .sort((a, b) => b.length - a.length)
    .find(locale => normalizedPathname === locale || normalizedPathname.startsWith(`${locale}/`));

  if (!sourceLocalePrefix) {
    return `${normalizedTargetPrefix}/`;
  }

  const pathnameWithoutLocale =
    normalizedPathname === sourceLocalePrefix
      ? ''
      : normalizedPathname.slice(sourceLocalePrefix.length);

  return `${normalizedTargetPrefix}${pathnameWithoutLocale || '/'}`;
}

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
    const localeKeys = Object.keys(locales);
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
