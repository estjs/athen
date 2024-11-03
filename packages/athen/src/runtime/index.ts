import { type InjectionKey, useInject } from 'essor';
import { routes } from 'athen:routes';
import type { PageData } from '@shared/types';

export const PageDataKey = Symbol(
  import.meta.env.DEV ? 'page date key' : '',
) as InjectionKey<PageData>;

let data;
export function setPageData(pageData: PageData) {
  data = pageData;
}
export const usePageData = () => {
  if (!import.meta.env.DEV) return data;
  return useInject(PageDataKey)!;
};

export const getAllPages = (
  filter: (route: (typeof routes)[number]) => boolean = () => true,
): Promise<PageData[]> => {
  return Promise.all(
    routes[0].children
      .filter(filter)
      .filter(Boolean)
      .map(async route => {
        const mod = await route.preload!();
        return {
          ...route,
          ...mod,
          routePath: route.path,
        } as unknown as PageData;
      }),
  );
};

export * from './utils';
export * from '@shared/utils';
