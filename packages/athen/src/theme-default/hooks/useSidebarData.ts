import { useReactive } from 'essor';
import { normalizeHref, withBase } from '@/runtime';
import type { DefaultTheme } from '@shared/types';
export function isEqualPath(a: string, b: string) {
  return normalizeHref(a) === normalizeHref(b);
}

interface SidebarData {
  // The group name for the sidebar
  group: string;
  items: DefaultTheme.SidebarGroup[];
}

export function useSidebarData(
  currentPathname: string,
  sidebar: DefaultTheme.Sidebar,
): SidebarData {
  currentPathname = decodeURIComponent(currentPathname);

  const items = useReactive([] as SidebarData['items']);

  for (const name of Object.keys(sidebar)) {
    // Such as `/api/`，it will return all the sidebar group
    if (isEqualPath(withBase(name), currentPathname)) {
      Object.assign(items, sidebar[name]);
      return {
        group: '',
        items,
      };
    }
    // Such as `/guide/getting-started`, it will return the guide groups and the group name `Introduction`
    const result = sidebar[name].find(group =>
      group.items.some(item => item.link && isEqualPath(withBase(item.link), currentPathname)),
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
}
