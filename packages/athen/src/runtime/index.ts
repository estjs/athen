import { type InjectionKey, useInject } from 'essor';
import { routes } from 'athen:routes';
import type { PageData } from '@shared/types';

export const PageDataKey = Symbol() as InjectionKey<PageData>;

export const usePageData = () => {
  return useInject(PageDataKey)!;
};

export const getAllPages = (
  filter: (route: (typeof routes)[number]) => boolean = () => true,
): Promise<PageData[]> => {
  return Promise.all(
    routes
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
