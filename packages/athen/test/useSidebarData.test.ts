import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { resolveSidebarData } from '../src/theme-default/hooks/useSidebarData';
import type { Sidebar } from '../src/shared/types';

vi.mock('@/runtime', () => ({
  normalizeHref: (url?: string) => url || '/',
  withBase: (url = '/') => url,
}));

describe('resolveSidebarData', () => {
  it('does not let the root sidebar key match every page', () => {
    const sidebar: Sidebar = {
      '/': [
        {
          text: 'Docs',
          items: [{ text: 'Home', link: '/' }],
        },
      ],
      '/guide/': [
        {
          text: 'Guide',
          items: [{ text: 'Install', link: '/guide/install' }],
        },
      ],
    };

    expect(resolveSidebarData('/guide/install', sidebar)).toEqual({
      group: 'Guide',
      items: sidebar['/guide/'],
    });
  });
});
