import { createRouter as createEssorRouter } from 'essor-router';
import { routes } from 'athen:routes';
import siteData from 'athen:site-data';
import { cleanUrl } from '@shared/utils';
import type { RouteRecordRaw, RouterHistory } from 'essor-router';
import type { FrontMatterMeta, Header, PageData, PageModule } from '@shared/types';

interface AthenRouteRecord {
  path: string;
  children?: AthenRouteRecord[];
  meta?: { filePath?: string; [key: string]: unknown };
  preload?: () => Promise<PageModule<unknown>>;
}

function inferPageType(mod?: PageModule<unknown>): PageData['pageType'] {
  if (!mod) return '404';
  const layout = mod.frontmatter?.layout;
  if (layout === 'home') return 'home';
  if (layout === 'api') return 'api';
  if (layout === 'custom') return 'custom';
  return 'doc';
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
    ...mod,
    // `toc`, `lastUpdatedTime`, `content` and friends are *conditional* MDX
    // named exports. Force explicit defaults for every PageData field so that
    // `Object.assign(pageData, ...)` on SPA navigation overwrites the previous
    // page's values instead of leaving stale data behind.
    frontmatter: mod?.frontmatter ?? ({} as FrontMatterMeta),
    title: (mod?.title as string | undefined) ?? '',
    description: (mod?.description as string | undefined) ?? '',
    lang: (mod?.lang as string | undefined) ?? '',
    toc: (mod?.toc as Header[] | undefined) ?? [],
    lastUpdatedTime: (mod?.lastUpdatedTime as string | undefined) ?? '',
    content: (mod?.content as string | undefined) ?? '',
  };
}

export const createRouter = (history: RouterHistory) =>
  createEssorRouter({ history, routes: routes as RouteRecordRaw[] });
