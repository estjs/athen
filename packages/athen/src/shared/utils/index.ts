import { normalizeLocalePrefix } from '@/shared/locale';
import type { HeadConfig, LocaleConfig, SiteData } from '@/shared/types';
export const queryRE = /\?.*$/s;
export const hashRE = /#.*$/s;
export const EXTERNAL_URL_RE = /^(https?:)?\/\//;

export const cleanUrl = (url: string): string => url.replace(hashRE, '').replace(queryRE, '');

export interface UrlPolicy {
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  rewrites?: Record<string, string>;
}

export const inBrowser = () => typeof window !== 'undefined';

export function addLeadingSlash(url: string) {
  const prefix = url.charAt(0) === '/' || url.startsWith('https') ? '' : '/';
  return prefix + url;
}

export function removeTrailingSlash(url: string) {
  return url.length > 1 && url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
}

export function normalizeSlash(url: string) {
  return removeTrailingSlash(addLeadingSlash(url || '/'));
}

function splitHash(url: string) {
  const [path, ...hashParts] = url.split('#');
  return {
    path,
    hash: hashParts.length ? `#${hashParts.join('#')}` : '',
  };
}

function normalizeRouteCore(routePath: string, policy: UrlPolicy = {}) {
  if (EXTERNAL_URL_RE.test(routePath)) {
    return routePath;
  }

  let route = cleanUrl(routePath || '/')
    .replaceAll('\\', '/')
    .replace(/\.(mdx?|html)$/, '')
    .replace(/\/index$/, '/')
    .replaceAll(/\/+/g, '/');

  route = addLeadingSlash(route);
  if (route !== '/') {
    if (policy.trailingSlash === true) {
      route = `${removeTrailingSlash(route)}/`;
    } else if (policy.trailingSlash === false) {
      route = removeTrailingSlash(route);
    }
  }

  return route || '/';
}

export function normalizePublicRoute(routePath: string, policy: UrlPolicy = {}) {
  return normalizeRouteCore(routePath, policy);
}

export function normalizeRouteTarget(target: string, policy: UrlPolicy = {}) {
  const { path, hash } = splitHash(target);
  return `${normalizeRouteCore(path, policy)}${hash}`;
}

export function applyRewrite(target: string, policy: UrlPolicy = {}) {
  const { path, hash } = splitHash(normalizeRouteTarget(target, policy));
  const rewrites = policy.rewrites || {};

  for (const [from, to] of Object.entries(rewrites)) {
    if (normalizeRouteCore(from, policy) === path) {
      return `${normalizeRouteCore(to, policy)}${hash}`;
    }
  }

  return `${path}${hash}`;
}

export function htmlFilePathFromRoute(routePath: string, policy: UrlPolicy = {}) {
  const route = normalizeRouteCore(routePath, policy);
  if (route === '/') {
    return 'index.html';
  }
  if (route.endsWith('/')) {
    return `${route}index.html`.replace(/^\//, '');
  }
  return `${route}.html`.replace(/^\//, '');
}

export function withBase(url = '/', base = '/'): string {
  if (EXTERNAL_URL_RE.test(url)) {
    return url;
  }
  const normalizedBase = normalizeSlash(base);
  const normalizedUrl = addLeadingSlash(url);
  return normalizedBase === '/' ? normalizedUrl : `${normalizedBase}${normalizedUrl}`;
}

export function removeBase(url: string, base = '/'): string {
  if (EXTERNAL_URL_RE.test(url)) {
    return url;
  }

  const normalizedUrl = addLeadingSlash(cleanUrl(url));
  const normalizedBase = normalizeSlash(base);
  if (normalizedBase === '/') {
    return normalizedUrl;
  }
  if (normalizedUrl === normalizedBase) {
    return '/';
  }
  if (normalizedUrl.startsWith(`${normalizedBase}/`)) {
    return normalizedUrl.slice(normalizedBase.length) || '/';
  }
  return normalizedUrl;
}
export const getRelativePagePath = (routePath: string, filePath: string, base: string) => {
  const extname = filePath.split('.').pop();
  const pagePath = removeTrailingSlash(removeBase(routePath, base));
  if (pagePath === '/') {
    return extname ? `index.${extname}` : 'index';
  }
  if (extname) {
    return `${pagePath}.${extname}`.replace(/^\//, '');
  }
  return pagePath.replace(/^\//, '');
};

export function normalizeRoutePath(routePath: string) {
  return routePath.replace(/\.html$/, '').replace(/\/index$/, '/');
}

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string) {
  return value.replaceAll(/[&<>"']/g, (char) => HTML_ESCAPE[char] || char);
}

function getNestedValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

/**
 * Substitute `{{ name }}` style placeholders in an HTML template. Values are
 * HTML-escaped so user-supplied site metadata can't break out of attributes;
 * pass raw HTML through `rawKeys` to skip escaping for fields like injected
 * head tags or SSR content.
 *
 * Unknown placeholders are replaced with the empty string so a missing field
 * doesn't surface as literal `{{ foo }}` text in the served page.
 */
export function renderTemplateVars(html: string, vars: object, rawKeys: string[] = []): string {
  const rawSet = new Set(rawKeys);
  return html.replaceAll(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const value = getNestedValue(vars, key);
    if (value == null) return '';
    const str = String(value);
    return rawSet.has(key) ? str : escapeHtml(str);
  });
}

/**
 * Subset of locale data we read for per-page template substitution. Unhead
 * owns title/description/lang now; this is just a typed view onto the locale
 * config for callers that still need site-level fallbacks.
 */
export interface LocaleTemplateContext {
  lang?: string;
  title?: string;
  description?: string;
  head?: HeadConfig[];
}

export interface TemplateVars {
  favicon: string;
  base: string;
  siteTitle: string;
}

function firstString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

/**
 * Pick the locale entry whose URL prefix matches `localePrefix` from
 * `siteData.locales`. Returns `undefined` for the root locale (or when no
 * locales are configured) so callers can short-circuit to site-level fields.
 */
export function getLocaleSiteData(
  siteData: SiteData,
  localePrefix?: string,
): LocaleTemplateContext | undefined {
  const locales = siteData.locales;
  if (!locales) return undefined;

  const target = normalizeLocalePrefix(localePrefix);
  const entry =
    Object.entries(locales).find(([key]) => normalizeLocalePrefix(key) === target) ??
    Object.entries(locales).find(([key]) => normalizeLocalePrefix(key) === '');
  if (!entry) return undefined;

  const [, locale] = entry as [string, LocaleConfig];
  return {
    lang: locale.lang,
    title: locale.title,
    description: locale.description,
    head: locale.head,
  };
}

/**
 * Build site-level template variables for `<root>/index.html` placeholders.
 * Per-page meta (`title`/`description`/`<html lang>`) is no longer rendered
 * here — Unhead injects those at render time. This function just produces the
 * static, site-level vars: favicon path, base URL, site title.
 */
export function buildTemplateVars(
  siteData: SiteData,
  locale?: LocaleTemplateContext,
): TemplateVars {
  return {
    favicon: siteData.favicon || '',
    base: siteData.base || '/',
    siteTitle: firstString(locale?.title, siteData.title) || 'Athen',
  };
}
