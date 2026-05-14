import path, { basename, extname } from 'node:path';
import { normalizePath } from 'vite';
import { addLeadingSlash, withBase } from '../../../shared/utils';
import { globSync } from 'glob';
import type { RouteOptions, UserConfig } from '../../../shared/types';

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

export class RouteService {
  private scanDir: string;
  private routeData: RouteMeta[] = [];

  constructor(scanDir: string) {
    this.scanDir = scanDir;
  }

  /** Get the route path from a file path, relative to the root and base. */
  static getRoutePathFromFile(filePath: string, root: string, base: string): string | undefined {
    const fileRelativePath = path.relative(root, filePath);
    const routePath = normalizePageRoutePath(fileRelativePath);
    return withBase(routePath, base);
  }

  /** Scan the directory and build route metadata. */
  init(routeOptions?: RouteOptions) {
    const defaultIgnores = ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.temp/**', 'athen.config.*'];
    const exclude = routeOptions?.exclude || [];
    const ignore = [...defaultIgnores, ...exclude];
    let includePattern: string | string[] = '**/*.{ts,tsx,jsx,md,mdx}';

    if (routeOptions?.include && routeOptions.include.length > 0) {
      includePattern = routeOptions.include;
    }

    const filePaths = globSync(includePattern, {
      cwd: this.scanDir,
      absolute: true,
      ignore,
    });

    for (const filePath of filePaths) {
      const fileRelativePath = normalizePath(path.relative(this.scanDir, filePath));
      const absolutePath = normalizePath(filePath);
      const routePath = normalizePageRoutePath(fileRelativePath);
      const name = basename(filePath, extname(filePath));

      this.routeData.push({ routePath, absolutePath, filePath: fileRelativePath, name });
    }
  }

  /** Generate the routes code based on the route data and site config. */
  generateRoutesCode(siteData?: UserConfig) {
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
