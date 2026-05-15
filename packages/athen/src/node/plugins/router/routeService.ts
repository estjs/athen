import path, { basename, extname } from 'node:path';
import { globSync } from 'glob';
import { normalizePath } from 'vite';
import {
  getDefaultLocaleSourcePrefix,
  stripLocalePrefix,
  type LocaleAwareConfig,
} from '../../../shared/locale';
import { addLeadingSlash, withBase } from '../../../shared/utils';
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

const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/build/**',
  '**/dist/**',
  '**/.temp/**',
  'athen.config.*',
];

const DEFAULT_ROUTE_INCLUDE_PATTERN = '**/*.{ts,tsx,jsx,md,mdx}';

type LocaleAwareSiteData = LocaleAwareConfig & {
  title?: string;
};

export function getDefaultLocalePrefix(siteData?: LocaleAwareSiteData): string | undefined {
  return getDefaultLocaleSourcePrefix(siteData);
}

function removeLocalePrefix(routePath: string, localePrefix?: string) {
  return stripLocalePrefix(routePath, localePrefix);
}

function getIncludePattern(routeOptions?: RouteOptions) {
  return routeOptions?.include?.length ? routeOptions.include : DEFAULT_ROUTE_INCLUDE_PATTERN;
}

function getIgnorePatterns(routeOptions?: RouteOptions) {
  return [...DEFAULT_IGNORE_PATTERNS, ...(routeOptions?.exclude || [])];
}

function resolveRoutePath(fileRelativePath: string, siteData?: LocaleAwareSiteData) {
  return removeLocalePrefix(
    normalizePageRoutePath(fileRelativePath),
    getDefaultLocalePrefix(siteData),
  );
}

function createRouteMeta(
  filePath: string,
  root: string,
  siteData?: LocaleAwareSiteData,
): RouteMeta {
  const fileRelativePath = normalizePath(path.relative(root, filePath));

  return {
    routePath: resolveRoutePath(fileRelativePath, siteData),
    absolutePath: normalizePath(filePath),
    filePath: fileRelativePath,
    name: basename(filePath, extname(filePath)),
  };
}

function collectRouteFiles(scanDir: string, routeOptions?: RouteOptions) {
  return globSync(getIncludePattern(routeOptions), {
    cwd: scanDir,
    absolute: true,
    ignore: getIgnorePatterns(routeOptions),
  });
}

function collectRouteMeta(
  scanDir: string,
  routeOptions?: RouteOptions,
  siteData?: LocaleAwareSiteData,
) {
  return collectRouteFiles(scanDir, routeOptions).map((filePath) =>
    createRouteMeta(filePath, scanDir, siteData),
  );
}

function renderRoutesCode(routeData: RouteMeta[], siteData?: LocaleAwareSiteData) {
  const siteName = siteData?.title || 'title';
  return `
      export const routes = [{
        path: '/',
        component: import('@theme-default/layout/index.tsx'),
        children: [${routeData
          .map((route) => {
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
    const fileRelativePath = normalizePath(path.relative(root, filePath));
    return withBase(resolveRoutePath(fileRelativePath, siteData), base);
  }

  /** Scan the directory and build route metadata. */
  init(routeOptions?: RouteOptions, siteData?: LocaleAwareSiteData) {
    this.routeData = collectRouteMeta(this.scanDir, routeOptions, siteData);
  }

  /** Generate the routes code based on the route data and site config. */
  generateRoutesCode(siteData?: LocaleAwareSiteData) {
    return renderRoutesCode(this.routeData, siteData);
  }
}
