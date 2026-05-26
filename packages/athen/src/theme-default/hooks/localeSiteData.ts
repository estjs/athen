import { normalizeSlash, withBase } from '../../shared/utils';
import type {
  EditLink,
  Footer,
  IconLink,
  Image,
  LocaleConfig,
  NavItem,
  ResolvedLocaleData,
  Sidebar,
  SiteData,
} from '../../shared/types';

/**
 * Merge a per-locale config over the root site data. Strategy is intentionally
 * explicit: nested record-like fields (`editLink`, `footer`) get a one-level
 * shallow merge; arrays (`nav`, `socialLinks`, `head`) and scalars override.
 */
function mergeLocale(siteData: SiteData, override?: LocaleConfig): ResolvedLocaleData {
  let editLink: EditLink | undefined;
  if (typeof override?.editLink === 'string') {
    editLink = { ...siteData.editLink, pattern: override.editLink };
  } else if (override?.editLink || siteData.editLink) {
    const base = siteData.editLink ?? { pattern: '' };
    editLink = { ...base, ...(override?.editLink as EditLink | undefined) };
  }

  const footer: Footer | undefined =
    override?.footer || siteData.footer ? { ...siteData.footer, ...override?.footer } : undefined;

  return {
    label: override?.label ?? '',
    lang: override?.lang ?? siteData.lang,
    langRoutePrefix: override?.langRoutePrefix,
    selectText: override?.selectText,
    title: override?.title ?? siteData.title,
    description: override?.description ?? siteData.description,
    head: override?.head,
    nav: (override?.nav ?? siteData.nav) as NavItem[] | undefined,
    sidebar: (siteData.sidebar ?? undefined) as Sidebar | undefined,
    socialLinks: (override?.socialLinks ?? siteData.socialLinks) as IconLink[] | undefined,
    editLink,
    footer,
    logo: (override?.logo ?? siteData.logo) as Image | undefined,
    lastUpdatedText: override?.lastUpdatedText,
    outlineTitle: override?.outlineTitle ?? siteData.outlineTitle,
    prevPageText: override?.prevPageText,
    nextPageText: override?.nextPageText,
  };
}

function resolveLocaleKey(
  locales: Record<string, LocaleConfig>,
  pathname: string,
  base: string,
): string {
  const path = pathname || '/';
  const keys = Object.keys(locales).sort(
    (a, b) => normalizeSlash(b).length - normalizeSlash(a).length,
  );
  return keys.find((key) => path.startsWith(withBase(normalizeSlash(key), base))) ?? keys[0];
}

/**
 * Resolve the locale view for the current page — `siteData` merged with the
 * matching `locales[<key>]` entry.
 */
export function resolveLocaleSiteData(
  siteData: SiteData,
  pathname: string,
  base = '/',
): ResolvedLocaleData {
  const locales = siteData.locales;
  if (!locales || Object.keys(locales).length === 0) {
    return mergeLocale(siteData);
  }
  const key = resolveLocaleKey(locales, pathname, base);
  const localeConfig = locales[key];
  const merged = mergeLocale(siteData, localeConfig);
  merged.langRoutePrefix = localeConfig?.langRoutePrefix ?? key;
  return merged;
}
