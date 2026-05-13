import { computed } from 'essor';
import { useLocaleSiteData } from './useLocaleSiteData';
import { usePathname } from './usePathname';
import { useSidebarData } from './useSidebarData';
import type { DefaultTheme } from '@shared/types';

export function usePrevNextPage() {
  const pathname = usePathname();
  const localesData = useLocaleSiteData();
  const sidebarData = useSidebarData(pathname, localesData);

  return computed(() => {
    const flattenTitles: DefaultTheme.SidebarItem[] = [];

    const walkThroughSidebarItems = (items: DefaultTheme.SidebarItem[]) => {
      items.forEach((item) => {
        if ('items' in item) {
          walkThroughSidebarItems(item.items);
        } else {
          flattenTitles.push(item);
        }
      });
    };

    sidebarData.value.items.forEach((sidebarGroup) => {
      walkThroughSidebarItems(sidebarGroup.items);
    });

    const pageIndex = flattenTitles.findIndex((item) => item.link === pathname.value);

    const prevPage = flattenTitles[pageIndex - 1] || null;
    const nextPage = flattenTitles[pageIndex + 1] || null;

    return {
      prevPage,
      nextPage,
    };
  });
}
