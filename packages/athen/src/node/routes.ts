import path, { basename, extname } from 'node:path';
import fs from 'fs-extra';
import { globSync } from 'glob';
import { normalizePath } from 'vite';
import Slugger from 'github-slugger';
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
const FRONTMATTER_LINE = /^([\w-]+):\s*(\S.*)$/;
const HEADING_LINE = /^(#{1,6})\s+(\S.*)$/;

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
  const cleanContent = content.startsWith('\uFEFF') ? content.slice(1) : content;
  if (!cleanContent.startsWith('---')) return {};
  const end = cleanContent.indexOf('\n---', 3);
  if (end < 0) return {};
  const out: Record<string, unknown> = {};
  for (const line of cleanContent.slice(3, end).split('\n')) {
    const m = FRONTMATTER_LINE.exec(line.trim());
    if (m) out[m[1]] = parseFrontmatterValue(m[2]);
  }
  return out;
}

function collectHeadings(content: string, onlyH1 = false) {
  const out: Array<{ id: string; text: string; depth: number }> = [];
  // Use github-slugger (the same slugger the MDX renderer + rehype-slug use)
  // with a per-document reset so anchor IDs \u2014 including dedup suffixes for
  // repeated headings (`#setup`, `#setup-1`) \u2014 match the rendered DOM. The
  // broken-link checker compares against these IDs.
  const slugger = new Slugger();
  for (const line of content.split('\n')) {
    const m = HEADING_LINE.exec(line.trim());
    if (!m) continue;
    const depth = m[1].length;
    if (onlyH1 && depth !== 1) continue;
    const text = m[2].replace(/\s+#$/, '').trim();
    out.push({ id: slugger.slug(text), text, depth });
    if (onlyH1 && depth === 1) break;
  }
  return out;
}

function resolveTitle(
  filePath: string,
  routePath: string,
  headings: ReturnType<typeof collectHeadings>,
) {
  const h1 = headings.find((h) => h.depth === 1);
  if (h1) return h1.text;
  const base = routePath.endsWith('/') ? basename(path.dirname(filePath)) : basename(filePath);
  return humanize(base.replace(/\.[^.]+$/, ''));
}

function readPageMeta(filePath: string, routePath: string, command: 'serve' | 'build' = 'build') {
  if (!isMarkdown(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);

  const onlyH1 = command === 'serve';
  const headings = collectHeadings(content, onlyH1);

  return {
    title: resolveTitle(filePath, routePath, headings),
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
  command: 'serve' | 'build' = 'build',
): RouteMeta {
  const fileRelativePath = normalizePath(path.relative(root, filePath));
  const routePath = resolveRoutePath(fileRelativePath, siteData, route);
  const baseMeta = {
    routePath,
    absolutePath: normalizePath(filePath),
    filePath: fileRelativePath,
    name: basename(filePath, extname(filePath)),
    ...resolveLocaleForRoute(routePath, siteData),
  };

  if (command === 'serve') {
    let parsed: any = null;
    const getParsed = () => {
      if (!parsed) {
        parsed = readPageMeta(filePath, routePath, command);
      }
      return parsed;
    };
    return Object.defineProperties(baseMeta, {
      title: {
        get() {
          return getParsed().title;
        },
        enumerable: true,
        configurable: true,
      },
      description: {
        get() {
          return getParsed().description;
        },
        enumerable: true,
        configurable: true,
      },
      frontmatter: {
        get() {
          return getParsed().frontmatter;
        },
        enumerable: true,
        configurable: true,
      },
      headings: {
        get() {
          return getParsed().headings;
        },
        enumerable: true,
        configurable: true,
      },
    }) as RouteMeta;
  }

  return {
    ...baseMeta,
    ...readPageMeta(filePath, routePath, command),
  };
}

export function collectRoutes(
  scanDir: string,
  routeOptions?: RouteOptions,
  siteData?: LocaleAwareSiteData,
  command: 'serve' | 'build' = 'build',
): RouteMeta[] {
  return globSync(includePattern(routeOptions), {
    cwd: scanDir,
    absolute: true,
    ignore: [...DEFAULT_IGNORE, ...(routeOptions?.exclude || [])],
  })
    .map((filePath) => buildRouteMeta(filePath, scanDir, siteData, routeOptions, command))
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
export function buildRoutesModule(
  routes: RouteMeta[],
  siteData?: LocaleAwareSiteData,
  isProduction = true,
): string {
  const siteName = siteData?.title || 'title';
  const records = routes.map((r) => {
    const meta = {
      name: siteName,
      filePath: r.filePath,
      headings: isProduction ? r.headings || [] : [],
      description: isProduction ? r.description || '' : '',
      lang: r.lang || '',
      localePrefix: r.localePrefix || '',
    };
    const title = isProduction ? r.title || r.name || 'title' : r.name ? humanize(r.name) : 'title';

    return `{
      path: ${JSON.stringify(r.routePath)},
      component: import(${JSON.stringify(r.absolutePath)}),
      preload: () => import(${JSON.stringify(r.absolutePath)}),
      title: ${JSON.stringify(title)},
      description: ${isProduction ? JSON.stringify(r.description || '') : '""'},
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
