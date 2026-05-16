import path, { basename, extname } from 'node:path';
import fs from 'fs-extra';
import { globSync } from 'glob';
import { normalizePath } from 'vite';
import {
  type LocaleAwareConfig,
  getDefaultLocaleSourcePrefix,
  stripLocalePrefix,
} from '../../../shared/locale';
import { addLeadingSlash, normalizePublicRoute, withBase } from '../../../shared/utils';
import type { RouteOptions } from '../../../shared/types';

export interface RouteMeta {
  routePath: string;
  absolutePath: string;
  filePath: string;
  name?: string;
  title?: string;
  frontmatter?: Record<string, unknown>;
  headings?: Array<{
    id: string;
    text: string;
    depth: number;
  }>;
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
  if (routeOptions?.include?.length) {
    return routeOptions.include;
  }
  if (routeOptions?.extensions?.length) {
    return `**/*.{${routeOptions.extensions.map((ext) => ext.replace(/^\./, '')).join(',')}}`;
  }
  return DEFAULT_ROUTE_INCLUDE_PATTERN;
}

function getIgnorePatterns(routeOptions?: RouteOptions) {
  return [...DEFAULT_IGNORE_PATTERNS, ...(routeOptions?.exclude || [])];
}

function withRoutePrefix(routePath: string, prefix?: string) {
  const normalizedPrefix = prefix?.replaceAll(/^\/+|\/+$/g, '');
  if (!normalizedPrefix) return routePath;

  return addLeadingSlash(`${normalizedPrefix}/${routePath.replace(/^\/+/, '')}`);
}

function isMarkdownFile(filePath: string) {
  return /\.mdx?$/.test(filePath);
}

function parseFrontmatterValue(value: string) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replaceAll(/^['"]|['"]$/g, '');
}

function parseFrontmatter(content: string) {
  if (!content.startsWith('---')) {
    return {};
  }

  const endIndex = content.indexOf('\n---', 3);
  if (endIndex < 0) {
    return {};
  }

  return content
    .slice(3, endIndex)
    .split('\n')
    .reduce<Record<string, unknown>>((frontmatter, line) => {
      const match = /^([\w-]+):\s*(.+)$/.exec(line.trim());
      if (match) {
        frontmatter[match[1]] = parseFrontmatterValue(match[2]);
      }
      return frontmatter;
    }, {});
}

function slugifyHeading(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replaceAll(/[^\w\u4E00-\u9FA5 -]/g, '')
    .replaceAll(/\s+/g, '-');
}

function collectHeadings(content: string) {
  return content
    .split('\n')
    .map((line) => /^(#{1,6})\s+(.+)$/.exec(line.trim()))
    .filter(Boolean)
    .map((match) => {
      const text = match![2].replace(/\s+#$/, '').trim();
      return {
        id: slugifyHeading(text),
        text,
        depth: match![1].length,
      };
    });
}

function formatTitle(value: string) {
  return value
    .replace(/\.[^.]+$/, '')
    .replaceAll(/[-_]+/g, ' ')
    .replaceAll(/\b\w/g, (char) => char.toUpperCase());
}

function readPageMeta(filePath: string, routePath: string) {
  if (!isMarkdownFile(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  const headings = collectHeadings(content);
  const h1 = headings.find((heading) => heading.depth === 1);
  const title =
    typeof frontmatter.title === 'string'
      ? frontmatter.title
      : h1?.text ||
        formatTitle(
          routePath.endsWith('/') ? basename(path.dirname(filePath)) : basename(filePath),
        );

  return {
    title,
    frontmatter,
    headings,
  };
}

function resolveRoutePath(
  fileRelativePath: string,
  siteData?: LocaleAwareSiteData,
  routeOptions?: RouteOptions,
) {
  const routePath = removeLocalePrefix(
    normalizePageRoutePath(fileRelativePath),
    getDefaultLocalePrefix(siteData),
  );
  return normalizePublicRoute(withRoutePrefix(routePath, routeOptions?.prefix), routeOptions);
}

function createRouteMeta(
  filePath: string,
  root: string,
  siteData?: LocaleAwareSiteData,
  routeOptions?: RouteOptions,
): RouteMeta {
  const fileRelativePath = normalizePath(path.relative(root, filePath));

  return {
    routePath: resolveRoutePath(fileRelativePath, siteData, routeOptions),
    absolutePath: normalizePath(filePath),
    filePath: fileRelativePath,
    name: basename(filePath, extname(filePath)),
    ...readPageMeta(filePath, resolveRoutePath(fileRelativePath, siteData, routeOptions)),
  };
}

function collectRouteFiles(scanDir: string, routeOptions?: RouteOptions) {
  return globSync(getIncludePattern(routeOptions), {
    cwd: scanDir,
    absolute: true,
    ignore: getIgnorePatterns(routeOptions),
  });
}

export function collectRouteMeta(
  scanDir: string,
  routeOptions?: RouteOptions,
  siteData?: LocaleAwareSiteData,
) {
  return collectRouteFiles(scanDir, routeOptions)
    .map((filePath) => createRouteMeta(filePath, scanDir, siteData, routeOptions))
    .sort((a, b) => a.routePath.localeCompare(b.routePath));
}

function renderRoutesCode(routeData: RouteMeta[], siteData?: LocaleAwareSiteData) {
  const siteName = siteData?.title || 'title';
  return `
      export const routes = [{
        path: '/',
        component: import('@theme'),
        children: [${routeData
          .map((route) => {
            return `
            {
                path: ${JSON.stringify(route.routePath)},
                component: import(${JSON.stringify(route.absolutePath)}),
                preload: () => import(${JSON.stringify(route.absolutePath)}),
                title: ${JSON.stringify(route.title || route.name || 'title')},
                absolutePath: ${JSON.stringify(route.absolutePath)},
                meta: {name: ${JSON.stringify(siteName)}, filePath: ${JSON.stringify(route.filePath)}, headings: ${JSON.stringify(route.headings || [])}}
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
    routeOptions?: RouteOptions,
  ): string | undefined {
    const fileRelativePath = normalizePath(path.relative(root, filePath));
    return withBase(resolveRoutePath(fileRelativePath, siteData, routeOptions), base);
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
