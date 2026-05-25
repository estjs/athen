import { normalizeSlash, withBase } from '../../shared/utils';
import type { DefaultTheme } from '../../shared/types';

type ThemeConfig = DefaultTheme.Config;
type LocaleThemeConfig = NonNullable<DefaultTheme.LocaleConfig['themeConfig']>;

/**
 * Merge a per-locale `themeConfig` over the root `themeConfig`.
 *
 * Strategy is intentionally **explicit, not recursive**: only the nested
 * record-like fields (`editLink`, `footer`, `slots`) get a one-level shallow
 * merge; arrays (`nav`, `links`, `head`) and scalars override. This keeps the
 * semantics greppable — a generic deepMerge would hide which fields support
 * partial overrides.
 */
function mergeLocaleTheme(root: ThemeConfig, override?: LocaleThemeConfig): ThemeConfig {
  if (!override) return root;
  return {
    ...root,
    ...override,
    editLink:
      override.editLink || root.editLink ? { ...root.editLink, ...override.editLink } : undefined,
    footer: override.footer || root.footer ? { ...root.footer, ...override.footer } : undefined,
    slots: override.slots || root.slots ? { ...root.slots, ...override.slots } : undefined,
  } as ThemeConfig;
}

function resolveLocaleKey(
  locales: NonNullable<DefaultTheme.Config['locales']>,
  pathname: string,
  base: string,
): string {
  const path = pathname || '/';
  const keysByPrefixLength = Object.keys(locales).sort(
    (a, b) => normalizeSlash(b).length - normalizeSlash(a).length,
  );
  return (
    keysByPrefixLength.find((key) => path.startsWith(withBase(normalizeSlash(key), base))) ??
    keysByPrefixLength[0]
  );
}

export function resolveLocaleSiteData(
  themeConfig: DefaultTheme.Config,
  pathname: string,
  base = '/',
): DefaultTheme.ResolvedLocaleSiteData {
  const { locales, ...rootTheme } = themeConfig;

  if (!locales || Object.keys(locales).length === 0) {
    return { label: '', ...rootTheme };
  }

  const langRoutePrefix = resolveLocaleKey(locales, pathname, base);
  const localeConfig = locales[langRoutePrefix];
  const merged = mergeLocaleTheme(rootTheme, localeConfig?.themeConfig);

  return {
    ...merged,
    label: localeConfig?.label ?? '',
    lang: localeConfig?.lang,
    selectText: localeConfig?.selectText,
    title: localeConfig?.title ?? merged.siteTitle,
    description: localeConfig?.description,
    head: localeConfig?.head,
    langRoutePrefix,
  };
}
