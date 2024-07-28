export const queryRE = /\?.*$/s;
export const hashRE = /#.*$/s;
export const EXTERNAL_URL_RE = /^(https?:)?\/\//;

export const cleanUrl = (url: string): string => url.replace(hashRE, '').replace(queryRE, '');

export const inBrowser = () => typeof window !== 'undefined';

export function addLeadingSlash(url: string) {
  return url.charAt(0) === '/' || url.startsWith('https') ? url : `/${url}`;
}

export function removeTrailingSlash(url: string) {
  return url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
}

export function normalizeSlash(url: string) {
  return removeTrailingSlash(addLeadingSlash(url));
}

export function withBase(url = '/', base = '/'): string {
  if (EXTERNAL_URL_RE.test(url)) {
    return url;
  }
  const normalizedBase = normalizeSlash(base);
  const normalizedUrl = addLeadingSlash(url);
  return `${normalizedBase}${normalizedUrl}`;
}

export function removeBase(url: string): string {
  const normalizedBase = normalizeSlash('/');
  return url.replace(normalizedBase, '');
}
export const getRelativePagePath = (routePath: string, filePath: string, base: string) => {
  const extname = filePath.split('.').pop();
  let pagePath = cleanUrl(routePath);
  if (pagePath.startsWith(base)) {
    pagePath = pagePath.slice(base.length);
  }
  if (extname) {
    pagePath += `.${extname}`;
  }
  return pagePath.replace(/^\//, '');
};
