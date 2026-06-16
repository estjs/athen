import { type InjectionKey, inject } from 'essor';
import { routes } from 'athen:routes';
import type { PageData } from '@shared/types';

type RouteRecord = (typeof routes)[number]['children'][number];

export const PageDataKey = Symbol(
  import.meta.env.DEV ? 'page data key' : '',
) as InjectionKey<PageData>;

export const usePageData = () => inject(PageDataKey)!;

/** Flattened list of leaf routes — strip the root `'/'` wrapper. */
export const flatRoutes = (): RouteRecord[] => routes[0].children;

export const getAllPages = async (
  filter: (route: RouteRecord) => boolean = () => true,
): Promise<PageData[]> => {
  const out: PageData[] = [];
  for (const route of flatRoutes().filter(filter)) {
    if (!route.preload) continue;
    const mod = await route.preload();
    out.push({ ...route, ...mod, routePath: route.path } as unknown as PageData);
  }
  return out;
};

export * from './utils';
export * from '@shared/utils';
