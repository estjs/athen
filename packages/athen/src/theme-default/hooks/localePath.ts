import { normalizeSlash } from '@/shared/utils/index';

function resolveLocalePath(prefix: string, pathname: string) {
  if (prefix === '/') {
    return pathname || '/';
  }

  return `${prefix}${pathname || '/'}`;
}

export function getLocalePath(
  pathname = '/',
  targetLocalePrefix = '/',
  localePrefixes: string[] = [],
) {
  const normalizedTargetPrefix = normalizeSlash(targetLocalePrefix);
  const normalizedPathname = normalizeSlash(pathname);
  const sourceLocalePrefix = localePrefixes
    .map((locale) => normalizeSlash(locale))
    .sort((a, b) => b.length - a.length)
    .find((locale) => {
      if (locale === '/') {
        return normalizedPathname.startsWith('/');
      }

      return normalizedPathname === locale || normalizedPathname.startsWith(`${locale}/`);
    });

  if (!sourceLocalePrefix) {
    return resolveLocalePath(normalizedTargetPrefix, '');
  }

  const pathnameWithoutLocale =
    normalizedPathname === sourceLocalePrefix
      ? ''
      : sourceLocalePrefix === '/'
        ? normalizedPathname
        : normalizedPathname.slice(sourceLocalePrefix.length);

  return resolveLocalePath(normalizedTargetPrefix, pathnameWithoutLocale);
}
