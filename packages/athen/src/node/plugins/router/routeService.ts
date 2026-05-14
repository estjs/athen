import path, { basename, extname } from 'node:path';
import { normalizePath } from 'vite';
import { addLeadingSlash, normalizeSlash, withBase } from '../../../shared/utils';
import { globSync } from 'glob';
import type { RouteOptions } from '../../../shared/types';

interface RouteMeta {
  routePath: string;
  absolutePath: string;
  filePath: string;
  name?: string;
}

/**
 * Normalize a route path by removing file extensions and trailing 'index',
 * then ensuring a leading slash.
 */
export function normalizePageRoutePath(routePath: string): string {
  routePath = routePath.replace(/\.(.*)$/, '').replace(/index$/, '');
  return addLeadingSlash(routePath);
}

type LocaleConfig = {
  lang?: string;
};

type LocaleAwareSiteData = {
  lang?: string;
  title?: string;
  themeConfig?: unknown;
};

function getLocales(siteData?: LocaleAwareSiteData): Record<string, LocaleConfig> | undefined {
  if (!siteData?.themeConfig || typeof siteData.themeConfig !== 'object') return;

  const locales = (siteData.themeConfig as { locales?: unknown }).locales;
  if (!locales || typeof locales !== 'object') return;

  return locales as Record<string, LocaleConfig>;
}

function getDefaultLocalePrefix(siteData?: LocaleAwareSiteData): string | undefined {
  const locales = getLocales(siteData);
  if (!locales) return;

  const localeEntry = Object.entries(locales).find(([, localeConfig]) => {
    if (!localeConfig?.lang || !siteData?.lang) return false;
    return siteData.lang.toLowerCase().startsWith(localeConfig.lang.toLowerCase());
  });

  if (!localeEntry) return;

  const [routePrefix, localeConfig] = localeEntry;
  if (normalizeSlash(routePrefix) !== '/') {
    return routePrefix;
  }

  const localeSourcePrefix = localeConfig.lang?.split('-')[0] || siteData?.lang?.split('-')[0];
  return localeSourcePrefix ? `/${localeSourcePrefix}/` : undefined;
}

function removeLocalePrefix(routePath: string, localePrefix?: string) {
  if (!localePrefix) return routePath;

  const normalizedRoutePath = normalizeSlash(routePath);
  const normalizedLocalePrefix = normalizeSlash(localePrefix);

  if (normalizedRoutePath === normalizedLocalePrefix) {
    return '/';
  }

  if (normalizedRoutePath.startsWith(`${normalizedLocalePrefix}/`)) {
    return addLeadingSlash(normalizedRoutePath.slice(normalizedLocalePrefix.length));
  }

  return routePath;
}

export class RouteService {
  private scanDir: string;
  private routeData: RouteMeta[] = [];

  constructor(scanDir: string) {
    this.scanDir = scanDir;
  }

  /** Get the route path from a file path, relative to the root and base. */
  static getRoutePathFromFile(
    filePath: string,
    root: string,
    base: string,
    siteData?: LocaleAwareSiteData,
  ): string | undefined {
    const fileRelativePath = path.relative(root, filePath);
    const routePath = removeLocalePrefix(
      normalizePageRoutePath(fileRelativePath),
      getDefaultLocalePrefix(siteData),
    );
    return withBase(routePath, base);
  }

  /** Scan the directory and build route metadata. */
  init(routeOptions?: RouteOptions, siteData?: LocaleAwareSiteData) {
    const defaultIgnores = ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.temp/**', 'athen.config.*'];
    const exclude = routeOptions?.exclude || [];
    const ignore = [...defaultIgnores, ...exclude];
    let includePattern: string | string[] = '**/*.{ts,tsx,jsx,md,mdx}';

    if (routeOptions?.include && routeOptions.include.length > 0) {
      includePattern = routeOptions.include;
    }

    const defaultLocalePrefix = getDefaultLocalePrefix(siteData);

    const filePaths = globSync(includePattern, {
      cwd: this.scanDir,
      absolute: true,
      ignore,
    });

    for (const filePath of filePaths) {
      const fileRelativePath = normalizePath(path.relative(this.scanDir, filePath));
      const absolutePath = normalizePath(filePath);
      const routePath = removeLocalePrefix(
        normalizePageRoutePath(fileRelativePath),
        defaultLocalePrefix,
      );
      const name = basename(filePath, extname(filePath));

      this.routeData.push({ routePath, absolutePath, filePath: fileRelativePath, name });
    }
  }

  /** Generate the routes code based on the route data and site config. */
  generateRoutesCode(siteData?: LocaleAwareSiteData) {
    const siteName = siteData?.title || 'title';
    return `
      export const routes = [{
        path: '/',
        component: import('@theme-default/layout/index.tsx'),
        children: [${this.routeData
          .map(route => {
            return `
            {
                path: ${JSON.stringify(route.routePath)},
                component: import(${JSON.stringify(route.absolutePath)}),
                preload: () => import(${JSON.stringify(route.absolutePath)}),
                title: ${JSON.stringify(route.name || 'title')},
                absolutePath: ${JSON.stringify(route.absolutePath)},
                meta: {name: ${JSON.stringify(siteName)}, filePath: ${JSON.stringify(route.filePath)}}
            }`;
          })
          .join(', ')}],
      }]
    `;
  }
}
