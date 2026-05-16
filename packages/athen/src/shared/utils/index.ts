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
