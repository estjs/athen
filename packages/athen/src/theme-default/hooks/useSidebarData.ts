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

function isExactSidebarKey(sidebarKey: string, decodedPathname: string) {
  const normalizedKey = normalizeHref(sidebarKey);
  const normalizedPathname = normalizeHref(decodedPathname);
  return normalizedKey === '/' ? normalizedPathname === '/' : normalizedKey === normalizedPathname;
}

export function resolveSidebarData(
  decodedPathname: string,
  sidebarByPath: DefaultTheme.Sidebar = {},
): SidebarData {
  for (const name of Object.keys(sidebarByPath)) {
    const items = sidebarByPath[name];
    if (isExactSidebarKey(name, decodedPathname)) {
      return { group: '', items };
    }

    const group = items.find((group) =>
      group.items.some((item) => item.link && isEqualPath(item.link, decodedPathname)),
    );
    if (group) {
      return { group: group.text || '', items };
    }
  }

  return { group: '', items: [] };
}

export function useSidebarData(
  currentPathname: { value: string },
  sidebar: Computed<DefaultTheme.LocaleConfig>,
): Computed<SidebarData> {
  return computed(() => {
    const decodedPathname = decodeURIComponent(currentPathname.value || '/');
    const sidebarByPath = Object.fromEntries(
      Object.entries(sidebar.value.sidebar || {}).map(([name, items]) => [
        withBase(name),
        items.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.link ? { ...item, link: withBase(item.link) } : item,
          ),
        })),
      ]),
    );

    return resolveSidebarData(decodedPathname, sidebarByPath);
  });
}
