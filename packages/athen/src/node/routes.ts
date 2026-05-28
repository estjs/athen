import path, { basename, extname } from 'node:path';
import fs from 'fs-extra';
import { globSync } from 'glob';
import { normalizePath } from 'vite';
import {
  type LocaleAwareConfig,
  findLocaleByRoutePath,
  getDefaultLocaleSourcePrefix,
  normalizeLanguageTag,
  stripLocalePrefix,
} from '../shared/locale';
import { humanize } from '../shared/title';
import { addLeadingSlash, normalizePublicRoute, withBase } from '../shared/utils';
import type { RouteMeta, RouteOptions } from '../shared/types';

export type { RouteMeta };

type LocaleAwareSiteData = LocaleAwareConfig & { title?: string };

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/build/**',
  '**/dist/**',
  '**/.temp/**',
  'athen.config.*',
];
const DEFAULT_INCLUDE = '**/*.{tsx,jsx,md,mdx}';
const FRONTMATTER_LINE = /^([\w-]+):\s*(.+)$/;
const HEADING_LINE = /^(#{1,6})\s+(.+)$/;

export function getDefaultLocalePrefix(siteData?: LocaleAwareSiteData) {
  return getDefaultLocaleSourcePrefix(siteData);
}

function isMarkdown(filePath: string) {
  return /\.mdx?$/.test(filePath);
}

function withRoutePrefix(routePath: string, prefix?: string) {
  const p = prefix?.replaceAll(/^\/+|\/+$/g, '');
  return p ? addLeadingSlash(`${p}/${routePath.replace(/^\/+/, '')}`) : routePath;
}

/** Strip extensions and trailing `index`, ensure a leading slash. */
export function normalizePageRoutePath(routePath: string): string {
  return addLeadingSlash(routePath.replaceAll(/\.[^.]+$|index$/g, ''));
}

function parseFrontmatterValue(value: string): unknown {
  const v = value.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v);
  return v.replaceAll(/^['"]|['"]$/g, '');
}

function parseFrontmatter(content: string): Record<string, unknown> {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end < 0) return {};
  const out: Record<string, unknown> = {};
  for (const line of content.slice(3, end).split('\n')) {
    const m = FRONTMATTER_LINE.exec(line.trim());
    if (m) out[m[1]] = parseFrontmatterValue(m[2]);
  }
  return out;
}

function slugifyHeading(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replaceAll(/[^\w一-龥 -]/g, '')
    .replaceAll(/\s+/g, '-');
}

function collectHeadings(content: string) {
  const out: Array<{ id: string; text: string; depth: number }> = [];
  for (const line of content.split('\n')) {
    const m = HEADING_LINE.exec(line.trim());
    if (!m) continue;
    const text = m[2].replace(/\s+#$/, '').trim();
    out.push({ id: slugifyHeading(text), text, depth: m[1].length });
  }
  return out;
}

function resolveTitle(
  filePath: string,
  routePath: string,
  frontmatter: Record<string, unknown>,
  headings: ReturnType<typeof collectHeadings>,
) {
  if (typeof frontmatter.title === 'string') return frontmatter.title;
  const h1 = headings.find((h) => h.depth === 1);
  if (h1) return h1.text;
  const base = routePath.endsWith('/') ? basename(path.dirname(filePath)) : basename(filePath);
  return humanize(base.replace(/\.[^.]+$/, ''));
}

function readPageMeta(filePath: string, routePath: string) {
  if (!isMarkdown(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  const headings = collectHeadings(content);
  return {
    title: resolveTitle(filePath, routePath, frontmatter, headings),
    description: typeof frontmatter.description === 'string' ? frontmatter.description : undefined,
    frontmatter,
    headings,
  };
}

function resolveLocaleForRoute(routePath: string, siteData?: LocaleAwareSiteData) {
  const match = findLocaleByRoutePath(siteData, routePath);
  if (!match) {
    return { localePrefix: '', lang: normalizeLanguageTag(siteData?.lang) || undefined };
  }
  const lang = normalizeLanguageTag(match.config?.lang);
  if (match.prefix) {
    return { localePrefix: match.prefix, lang: lang || match.prefix };
  }
  return { localePrefix: '', lang: lang || normalizeLanguageTag(siteData?.lang) || undefined };
}

function resolveRoutePath(
  fileRelativePath: string,
  siteData?: LocaleAwareSiteData,
  route?: RouteOptions,
) {
  const stripped = stripLocalePrefix(
    normalizePageRoutePath(fileRelativePath),
    getDefaultLocaleSourcePrefix(siteData),
  );
  return normalizePublicRoute(withRoutePrefix(stripped, route?.prefix), route);
}

function includePattern(route?: RouteOptions) {
  if (route?.include?.length) return route.include;
  if (route?.extensions?.length)
    return `**/*.{${route.extensions.map((e) => e.replace(/^\./, '')).join(',')}}`;
  return DEFAULT_INCLUDE;
}

function buildRouteMeta(
  filePath: string,
  root: string,
  siteData?: LocaleAwareSiteData,
  route?: RouteOptions,
): RouteMeta {
  const fileRelativePath = normalizePath(path.relative(root, filePath));
  const routePath = resolveRoutePath(fileRelativePath, siteData, route);
  return {
    routePath,
    absolutePath: normalizePath(filePath),
    filePath: fileRelativePath,
    name: basename(filePath, extname(filePath)),
    ...resolveLocaleForRoute(routePath, siteData),
    ...readPageMeta(filePath, routePath),
  };
}

export function collectRoutes(
  scanDir: string,
  routeOptions?: RouteOptions,
  siteData?: LocaleAwareSiteData,
): RouteMeta[] {
  return globSync(includePattern(routeOptions), {
    cwd: scanDir,
    absolute: true,
    ignore: [...DEFAULT_IGNORE, ...(routeOptions?.exclude || [])],
  })
    .map((filePath) => buildRouteMeta(filePath, scanDir, siteData, routeOptions))
    .sort((a, b) => a.routePath.localeCompare(b.routePath));
}

/** Resolve a source file path to its public URL. */
export function routeFromFilePath(
  filePath: string,
  root: string,
  base: string,
  siteData?: LocaleAwareSiteData,
  routeOptions?: RouteOptions,
): string | undefined {
  const fileRelativePath = normalizePath(path.relative(root, filePath));
  return withBase(resolveRoutePath(fileRelativePath, siteData, routeOptions), base);
}

function normalizeRequestPath(value: string): string {
  let p = value.split('?')[0].split('#')[0] || '/';
  p = p.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

/** Find the route matching a request URL, or undefined for 404. */
export function findRoute(routes: RouteMeta[], rawPath: string): RouteMeta | undefined {
  const target = normalizeRequestPath(rawPath);
  return routes.find((r) => normalizeRequestPath(r.routePath) === target);
}

/** Build the source code of the `athen:routes` virtual module. */
export function buildRoutesModule(routes: RouteMeta[], siteData?: LocaleAwareSiteData): string {
  const siteName = siteData?.title || 'title';
  const records = routes.map((r) => {
    const meta = {
      name: siteName,
      filePath: r.filePath,
      headings: r.headings || [],
      description: r.description || '',
      lang: r.lang || '',
      localePrefix: r.localePrefix || '',
    };
    return `{
      path: ${JSON.stringify(r.routePath)},
      component: import(${JSON.stringify(r.absolutePath)}),
      preload: () => import(${JSON.stringify(r.absolutePath)}),
      title: ${JSON.stringify(r.title || r.name || 'title')},
      description: ${JSON.stringify(r.description || '')},
      lang: ${JSON.stringify(r.lang || '')},
      localePrefix: ${JSON.stringify(r.localePrefix || '')},
      absolutePath: ${JSON.stringify(r.absolutePath)},
      meta: ${JSON.stringify(meta)}
    }`;
  });
  return `export const routes = [{
  path: '/',
  component: import('@theme'),
  children: [${records.join(',\n')}]
}]`;
}
