import { type Computed, computed } from 'essor';
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
  currentPathname: { value: string },
  sidebar: Computed<DefaultTheme.LocaleConfig>,
): Computed<SidebarData> {
  return computed(() => {
    const decodedPathname = decodeURIComponent(currentPathname.value || '/');
    const sidebarByPath = sidebar.value.sidebar || {};

    for (const name of Object.keys(sidebarByPath)) {
      const items = sidebarByPath[name];
      if (isEqualPath(withBase(name), decodedPathname)) {
        return { group: '', items };
      }

      const group = items.find((group) =>
        group.items.some((item) => item.link && isEqualPath(withBase(item.link), decodedPathname)),
      );
      if (group) {
        return { group: group.text || '', items };
      }
    }

    return { group: '', items: [] };
  });
}
