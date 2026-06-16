import { computed } from 'essor';
import { withBase } from '@/runtime';
import { useLocaleSiteData } from './useLocaleSiteData';
import { usePathname } from './usePathname';
import { isEqualPath, useSidebarData } from './useSidebarData';
import type { SidebarItem } from '@shared/types';

type SidebarLink = Extract<SidebarItem, { link: string }>;

function flattenSidebarItems(items: SidebarItem[]): SidebarLink[] {
  return items.flatMap((item) => ('items' in item ? flattenSidebarItems(item.items) : [item]));
}

export function usePrevNextPage() {
  const pathname = usePathname();
  const localesData = useLocaleSiteData();
  const sidebarData = useSidebarData(pathname, localesData);

  return computed(() => {
    const pages = sidebarData.value.items.flatMap((sidebarGroup) =>
      flattenSidebarItems(sidebarGroup.items),
    );

    // Sidebar links are `withBase`-prefixed (see useSidebarData) while
    // `pathname` is the un-based routePath; normalize both before comparing so
    // prev/next still match under a non-default `base`.
    const currentHref = withBase(pathname.value);
    const pageIndex = pages.findIndex((item) => isEqualPath(item.link, currentHref));

    const prevPage = pages[pageIndex - 1] || null;
    const nextPage = pages[pageIndex + 1] || null;

    return {
      prevPage,
      nextPage,
    };
  });
}
