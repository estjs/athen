import { type InjectionKey, inject } from 'essor';
import { routes } from 'athen:routes';
import type { PageData } from '@shared/types';

type RouteRecord = (typeof routes)[number]['children'][number];

export const PageDataKey = Symbol(
  import.meta.env.DEV ? 'page date key' : '',
) as InjectionKey<PageData>;

export const usePageData = () => inject(PageDataKey)!;

/** Flattened list of leaf routes — strip the root `'/'` wrapper. */
export const flatRoutes = (): RouteRecord[] => routes[0].children;

export const getAllPages = (
  filter: (route: RouteRecord) => boolean = () => true,
): Promise<PageData[]> =>
  Promise.all(
    flatRoutes()
      .filter(filter)
      .filter(Boolean)
      .map(async (route) => {
        const mod = await route.preload!();
        return { ...route, ...mod, routePath: route.path } as unknown as PageData;
      }),
  );

export * from './utils';
export * from '@shared/utils';
