import { addLeadingSlash, normalizeSlash, removeTrailingSlash } from '../shared/utils';

export const isProduction = () => import.meta.env.PROD;

export const omit = (obj: Record<string, unknown>, keys: string[]) => {
  const ret = { ...obj };
  for (const key of keys) {
    delete ret[key];
  }
  return ret;
};

export function normalizeHref(url?: string) {
  if (!url) {
    return '/';
  }
  if (!isProduction() || url.startsWith('http')) {
    return url;
  }

  let suffix = '';
  if (!import.meta.env.ENABLE_SPA) {
    suffix += '.html';
    if (url.endsWith('/')) {
      suffix = `index${suffix}`;
    }
  }
  return addLeadingSlash(`${url}${suffix}`);
}

export function normalizeRoutePath(routePath: string) {
  return routePath.replace(/\.html$/, '').replace(/\/index$/, '/');
}

export { addLeadingSlash, removeTrailingSlash, normalizeSlash };
