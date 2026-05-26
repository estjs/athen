import { createRouter as createEssorRouter } from 'essor-router';
import { routes } from 'athen:routes';
import siteData from 'athen:site-data';
import { cleanUrl } from '@shared/utils';
import type { RouteRecordRaw, RouterHistory } from 'essor-router';
import type { FrontMatterMeta, PageData, PageModule } from '@shared/types';

interface AthenRouteRecord {
  path: string;
  children?: AthenRouteRecord[];
  meta?: { filePath?: string; [key: string]: unknown };
  preload?: () => Promise<PageModule<unknown>>;
}

function inferPageType(mod?: PageModule<unknown>): PageData['pageType'] {
  if (!mod) return '404';
  if (mod.frontmatter?.pageType) return mod.frontmatter.pageType as PageData['pageType'];
  return mod.frontmatter?.layout === 'home' ? 'home' : 'doc';
}

/**
 * Initialize page data for a given route path by loading the matched route's
 * module and composing the full PageData object. Returns 404 page data when
 * the route is unmatched.
 */
export async function initPageData(routerPath: string): Promise<PageData> {
  const root = routes[0] as AthenRouteRecord;
  const matched = root.children?.find((r) => r.path === routerPath);
  const mod = matched?.preload ? await matched.preload() : undefined;

  return {
    siteData,
    pagePath: routerPath,
    routePath: routerPath,
    relativePagePath: mod ? cleanUrl(matched?.meta?.filePath ?? '') : '',
    pageType: inferPageType(mod),
    frontmatter: mod?.frontmatter ?? ({} as FrontMatterMeta),
    ...mod,
  };
}

export const createRouter = (history: RouterHistory) =>
  createEssorRouter({ history, routes: routes as RouteRecordRaw[] });
