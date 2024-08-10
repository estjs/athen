import path from 'node:path';
import { readdir } from 'node:fs';
import fastGlob from 'fast-glob';
import { normalizePath } from 'vite';
import { addLeadingSlash, withBase } from '@shared/utils';
import { globSync } from 'glob';
import tinyGlob from 'tiny-glob';
import type { UserConfig } from '@shared/types';
interface RouteMeta {
  routePath: string;
  absolutePath: string;
  filePath: string;
  name?: string;
}

// Normalize the route path by removing extensions and 'index' filenames
export const normalizeRoutePath = (routePath: string) => {
  routePath = routePath.replace(/\.(.*)$/, '').replace(/index$/, '');
  return addLeadingSlash(routePath);
};

export class RouteService {
  private scanDir: string;
  private routeData: RouteMeta[] = [];

  constructor(scanDir: string) {
    this.scanDir = scanDir;
  }

  // Get the route path from a file path, relative to the root and base
  static getRoutePathFromFile(filePath: string, root: string, base: string): string | undefined {
    const fileRelativePath = path.relative(root, filePath);
    const routePath = normalizeRoutePath(fileRelativePath);
    return withBase(routePath, base);
  }

  // Initialize the route service by scanning the directory for files
  init() {
    console.log('scanPath', this.scanDir);

    const files = fastGlob
      .sync(['**/*.{ts,tsx,jsx,md,mdx}'], {
        cwd: this.scanDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/build/**', 'athen.config.ts'],
        objectMode: true,
        throwErrorOnBrokenSymbolicLink: true,
      })
      .sort();

    const files2 = globSync('**/*.{ts,tsx,jsx,md,mdx}', {
      cwd: this.scanDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/build/**', 'athen.config.ts'],
    });
    tinyGlob('**/*.{ts,tsx,jsx,md,mdx}', {
      cwd: this.scanDir,
      absolute: true,
    }).then(f => {
      console.log('file3', f);
    });
    console.log('file2', files2);

    readdir(this.scanDir, (err, files) => {
      if (err) return;
      console.log('node read files', files);
    });

    console.log(files);

    files.forEach(file => {
      // Convert Windows file paths from \ to /
      const fileRelativePath = normalizePath(path.relative(this.scanDir, file.path));

      // 1. Route path
      const routePath = this.normalizeRoutePath(fileRelativePath);

      // 2. Absolute file path
      this.routeData.push({
        routePath,
        absolutePath: file.path,
        filePath: fileRelativePath,
        name: file.name.split('.')[0],
      });
    });
  }

  // Generate the routes code based on the route data and site config
  generateRoutesCode(siteData?: UserConfig) {
    return `
      export const routes = [${this.routeData
        .map(route => {
          return `
          {
              path: "${route.routePath}",
              component:import("${route.absolutePath}"),
              preload: () => import("${route.absolutePath}"),
              title: "${route.name || 'title'}",
              absolutePath: "${route.absolutePath}",
              meta: {name: "${siteData?.title || 'title'}", filePath: "${route.filePath}"}
          }`;
        })
        .join(', ')}]
    `;
  }

  // Normalize the route path by removing extensions and 'index' filenames, and ensuring it starts with a slash
  private normalizeRoutePath(rawPath: string) {
    const routePath = rawPath.replace(/\.(.*)$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }
}
