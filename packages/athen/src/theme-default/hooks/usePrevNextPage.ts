import { computed } from 'essor';
import { useLocaleSiteData } from './useLocaleSiteData';
import { usePathname } from './usePathname';
import { useSidebarData } from './useSidebarData';
import type { DefaultTheme } from '@shared/types';

type SidebarLink = Extract<DefaultTheme.SidebarItem, { link: string }>;

function flattenSidebarItems(items: DefaultTheme.SidebarItem[]): SidebarLink[] {
  return items.flatMap(item => ('items' in item ? flattenSidebarItems(item.items) : [item]));
}

export function usePrevNextPage() {
  const pathname = usePathname();
  const localesData = useLocaleSiteData();
  const sidebarData = useSidebarData(pathname, localesData);

  return computed(() => {
    const pages = sidebarData.value.items.flatMap(sidebarGroup =>
      flattenSidebarItems(sidebarGroup.items),
    );

    const pageIndex = pages.findIndex((item) => item.link === pathname.value);

    const prevPage = pages[pageIndex - 1] || null;
    const nextPage = pages[pageIndex + 1] || null;

    return {
      prevPage,
      nextPage,
    };
  });
}
