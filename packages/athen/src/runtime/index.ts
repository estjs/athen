import { useInject } from 'essor';
import { routes } from 'athen:routes';
import type { PageData } from '@shared/types';

export const usePageData = () => {
  return useInject('pageData');
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
