import { computed } from 'essor';
import { useLocaleSiteData } from './useLocaleSiteData';
import { usePathname } from './usePathname';
import type { DefaultTheme } from '@shared/types';

export function usePrevNextPage() {
  const pathname = usePathname();
  const localesData = useLocaleSiteData();

  return computed(() => {
    const sidebar = localesData.value.sidebar || {};
    const flattenTitles: DefaultTheme.SidebarItem[] = [];

    const walkThroughSidebar = (sidebar: DefaultTheme.Sidebar | DefaultTheme.SidebarGroup[]) => {
      if (Array.isArray(sidebar)) {
        sidebar.forEach(sidebarGroup => {
          sidebarGroup.items.forEach(item => {
            flattenTitles.push(item);
          });
        });
      } else {
        Object.keys(sidebar).forEach(key => {
          walkThroughSidebar(sidebar[key]);
        });
      }
    };

    walkThroughSidebar(sidebar);

    const pageIndex = flattenTitles.findIndex(item => item.link === pathname.value);

    const prevPage = flattenTitles[pageIndex - 1] || null;
    const nextPage = flattenTitles[pageIndex + 1] || null;

    return {
      prevPage,
      nextPage,
    };
  });
}
