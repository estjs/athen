import { type Computed, type Signal, computed } from 'essor';
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
  currentPathname: Signal<string>,
  sidebar: any,
): Computed<SidebarData> {
  return computed(() => {
    const decodedPathname = decodeURIComponent(currentPathname.value);
    const items: SidebarData['items'] = [];
    const sv2 = sidebar.value.sidebar!;
    console.log('sidebar');
    for (const name of Object.keys(sv2)) {
      if (isEqualPath(withBase(name), decodedPathname)) {
        Object.assign(items, sv2[name]);
        return {
          group: '',
          items,
        };
      }
      const result = sv2[name].find((group) =>
        group.items.some((item) => item.link && isEqualPath(withBase(item.link), decodedPathname)),
      );
      if (result) {
        Object.assign(items, sv2[name]);
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
