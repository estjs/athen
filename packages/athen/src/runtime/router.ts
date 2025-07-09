import { createRouter as createEssorRouter } from 'essor-router';
import { routes } from 'athen:routes';
import siteData from 'athen:site-data';
import { cleanUrl, getRelativePagePath } from '@shared/utils';
import type { FrontMatterMeta, PageData } from '@shared/types';

/**
 * Get the page data of the given route path.
 *
 * @param routerPath The route path.
 * @returns The page data.
 */
export async function initPageData(routerPath: string): Promise<PageData> {
  const router = routes[0];
  const matched = router.children.filter(route => route.path === routerPath);

  if (matched.length > 0 && matched[0].preload) {
    const moduleInfo = await matched[0].preload();

    const pagePath = cleanUrl((matched[0].meta as Record<string, any>).filePath!);
    const relativePagePath = getRelativePagePath(routerPath, pagePath, siteData.base);

    return {
      pageType: moduleInfo.frontmatter?.pageType ?? (moduleInfo.frontmatter?.layout === 'home' ? 'home' : 'doc'),
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

export const createRouter = history => {
  return createEssorRouter({
    history,
    routes,
  });
};
