import { describe, expect, it, vi } from 'vitest';
import { pluginMdx } from '../src/index';

vi.mock('simple-git', () => ({
  simpleGit: () => ({ log: async () => ({ latest: null }) }),
}));

describe('pluginMdx factory', () => {
  it(
    'composes mdx-rolldown, essor rewriter, last-update, and raw-content plugins',
    { timeout: 30000 },
    async () => {
      const plugins = await pluginMdx({ root: '/', base: '/', essor: true });
      const names = plugins.map((p) => p.name);

      expect(names).toContain('athen:mdx-rolldown');
      expect(names).toContain('vite-plugin-mdx-essor');
      expect(names).toContain('vite-plugin-mdx-last-update');
      expect(names).toContain('vite-plugin-mdx-raw-content');
    },
  );

  it('omits the essor rewriter when essor is disabled', { timeout: 30000 }, async () => {
    const plugins = await pluginMdx({ root: '/', base: '/', essor: false });
    const names = plugins.map((p) => p.name);

    expect(names).not.toContain('vite-plugin-mdx-essor');
    expect(names).toContain('athen:mdx-rolldown');
  });

  it('appends user-supplied plugins after built-ins', { timeout: 30000 }, async () => {
    const userPlugin = { name: 'user-plugin' };
    const plugins = await pluginMdx({
      root: '/',
      base: '/',
      essor: false,
      plugins: [userPlugin] as any,
    });

    expect(plugins.at(-1)?.name).toBe('user-plugin');
  });
});
