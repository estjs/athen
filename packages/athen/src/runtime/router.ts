import { createRouter as createEssorRouter } from 'essor-router';
import { routes } from 'athen:routes';
import siteData from 'athen:site-data';
import { cleanUrl, getRelativePagePath } from '@shared/utils';
import type { FrontMatterMeta, PageData, PageModule } from '@shared/types';
import type { RouteRecordRaw, RouterHistory } from 'essor-router';

type AthenRouteRecord = Omit<RouteRecordRaw, 'children' | 'meta'> & {
  path: string;
  children?: AthenRouteRecord[];
  meta?: {
    filePath?: string;
    [key: string]: unknown;
  };
  preload?: () => Promise<PageModule<unknown>>;
};

/**
 * Get the page data of the given route path.
 *
 * @param routerPath The route path.
 * @returns The page data.
 */
export async function initPageData(routerPath: string): Promise<PageData> {
  const router = routes[0] as AthenRouteRecord;
  const matched = router.children?.find((route) => route.path === routerPath);

  if (matched?.preload) {
    const moduleInfo = await matched.preload();

    const pagePath = cleanUrl(matched.meta?.filePath ?? '');
    const relativePagePath = getRelativePagePath(routerPath, pagePath, siteData.base);

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
    frontmatter: {} as FrontMatterMeta,
  } as PageData;
}

export const createRouter = (history: RouterHistory) => {
  return createEssorRouter({
    history,
    routes: routes as RouteRecordRaw[],
  });
};
