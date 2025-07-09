import { cwd } from 'node:process';
import { describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';

// Mock plugins-mdx to bypass build requirement during tests
vi.mock('plugins-mdx', () => ({
  pluginMdx: () => ({ name: 'plugins-mdx' }),
}));

// Deferred import to ensure mock is applied first
const loadCreateVitePlugins = async () => {
  const mod = await import('../src/node/plugins');
  return mod.createVitePlugins;
};

/**
 * Ensure that when a user supplies a plugin whose `name` matches a built-in one,
 * the built-in plugin is filtered out and only the user plugin is kept.
 */
describe('createVitePlugins override logic', () => {
  it('removes built-ins overridden by user plugin', async () => {
    // Dummy user plugin that overrides the built-in route plugin
    const userPlugin: Plugin = {
      name: 'athen:routes',
      transform(code) {
        return code;
      },
    };

    const config: any = {
      root: cwd(),
      srcDir: '',
      plugins: [userPlugin],
      // Disable optional built-ins to avoid dynamic imports during test
      search: false,
      analytics: false,
    };

    const createVitePlugins = await loadCreateVitePlugins();
    const plugins = await createVitePlugins(config, true);

    // There should be exactly one plugin carrying the overridden name
    const matching = plugins.filter(
      p => typeof p !== 'function' && (p as Plugin).name === 'athen:routes',
    );
    expect(matching.length).toBe(1);
    // And that plugin must be the user-supplied one (first in array by design)
    expect(matching[0]).toBe(userPlugin);
  });
});
