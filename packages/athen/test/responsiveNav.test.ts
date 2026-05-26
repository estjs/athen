import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = join(import.meta.dirname, '../src/theme-default');

const readThemeFile = (file: string) => readFileSync(join(themeRoot, file), 'utf8');

describe('responsive navigation breakpoints', () => {
  it('uses the same 960px breakpoint for sidebar and hamburger navigation', () => {
    const nav = readThemeFile('components/Nav/index.tsx');
    const navStyle = readThemeFile('components/Nav/style.css');
    const sidebarStyle = readThemeFile('components/SideBar/style.css');

    expect(sidebarStyle).toContain('@media (min-width: 960px)');
    expect(nav).not.toContain('lg:hidden');
    expect(nav).not.toContain('hidden lg:flex');
    expect(nav).toContain('nav-desktop-links');
    expect(nav).toContain('nav-sidebar-toggle');
    expect(navStyle).toContain('@media (min-width: 960px)');
    expect(navStyle).toContain('.nav-desktop-links');
    expect(navStyle).toContain('.nav-sidebar-toggle');
  });
});
