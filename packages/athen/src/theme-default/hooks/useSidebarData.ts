import { type Computed, useComputed } from 'essor';
import { normalizeHref, withBase } from '@/runtime';
import type { DefaultTheme } from '@shared/types';

export function isEqualPath(a: string, b: string) {
  return normalizeHref(a) === normalizeHref(b);
}

interface SidebarData {
  group: string;
  items: DefaultTheme.SidebarGroup[];
}

export function useSidebarData(
  currentPathname: string,
  sidebar: DefaultTheme.Sidebar,
): Computed<SidebarData> {
  return useComputed(() => {
    const decodedPathname = decodeURIComponent(currentPathname);
    const items: SidebarData['items'] = [];
    for (const name of Object.keys(sidebar)) {
      if (isEqualPath(withBase(name), decodedPathname)) {
        Object.assign(items, sidebar[name]);
        return {
          group: '',
          items,
        };
      }
      const result = sidebar[name].find(group =>
        group.items.some(item => item.link && isEqualPath(withBase(item.link), decodedPathname)),
      );
      if (result) {
        Object.assign(items, sidebar[name]);
        return {
          group: result.text || '',
          items,
        };
      }
    }
    return {
      group: '',
      items: [],
    };
  });
}
