import { createRouter as createEssorRouter } from 'essor-router';
import { routes } from 'athen:routes';
import siteData from 'athen:site-data';
import { cleanUrl } from '@shared/utils';
import type { RouteRecordRaw, RouterHistory } from 'essor-router';
import type { FrontMatterMeta, PageData, PageModule } from '@shared/types';

interface AthenRouteRecord {
  path: string;
  children?: AthenRouteRecord[];
  meta?: {
    filePath?: string;
    [key: string]: unknown;
  };
  preload?: () => Promise<PageModule<unknown>>;
}

/**
 * Initialize page data for a given route path by loading the matched route's
 * module and composing the full PageData object.
 */
export async function initPageData(routerPath: string): Promise<PageData> {
  const router = routes[0] as AthenRouteRecord;
  const matched = router.children?.find((route) => route.path === routerPath);

  if (matched?.preload) {
    const moduleInfo = await matched.preload();
    const pagePath = cleanUrl(matched.meta?.filePath ?? '');
    const relativePagePath = pagePath;

    return {
      pageType:
        moduleInfo.frontmatter?.pageType ??
        (moduleInfo.frontmatter?.layout === 'home' ? 'home' : 'doc'),
      siteData,
      pagePath: routerPath,
      routePath: routerPath,
      relativePagePath,
      ...moduleInfo,
    };
  }

  return {
    siteData,
    pagePath: routerPath,
    routePath: routerPath,
    relativePagePath: '',
    pageType: '404',
    frontmatter: {} as FrontMatterMeta,
  };
}

export const createRouter = (history: RouterHistory) => {
  return createEssorRouter({
    history,
    routes: routes as RouteRecordRaw[],
  });
};
