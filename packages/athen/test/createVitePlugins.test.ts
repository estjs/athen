import { cwd } from 'node:process';
import { describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';

// Mock plugins-mdx to bypass build requirement during tests
vi.mock('@athen/plugin-mdx', () => ({
  pluginMdx: () => ({ name: 'plugins-mdx' }),
}));

// Mock the router service to avoid @shared/utils import issue
vi.mock('../src/node/plugins/router/routeService', () => ({
  RouteService: class MockRouteService {
    scanRoutes() {
      return [];
    }
    getRoutes() {
      return [];
    }
  },
}));

// Mock other problematic imports
vi.mock('../src/node/plugins/router', () => ({
  default: () => ({ name: 'athen:routes' }),
}));

vi.mock('../src/node/plugins/athen', () => ({
  pluginAthen: () => ({ name: 'athen:config' }),
}));

vi.mock('../src/node/plugins/svgr', () => ({
  pluginSvgr: () => ({ name: 'athen:svgr' }),
}));

vi.mock('../src/node/plugins/mdxHmr', () => ({
  pluginMdxHMR: () => ({ name: 'athen:mdx-hmr' }),
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

  it('includes user plugins at the beginning of the array', async () => {
    const userPlugin: Plugin = {
      name: 'my-custom-plugin',
      transform(code) {
        return code;
      },
    };

    const config: any = {
      root: cwd(),
      srcDir: '',
      plugins: [userPlugin],
      search: false,
      analytics: false,
    };

    const createVitePlugins = await loadCreateVitePlugins();
    const plugins = await createVitePlugins(config, true);

    // User plugin should be first
    expect(plugins[0]).toBe(userPlugin);
  });

  it('returns built-in plugins when no user plugins provided', async () => {
    const config: any = {
      root: cwd(),
      srcDir: '',
      plugins: [],
      search: false,
      analytics: false,
    };

    const createVitePlugins = await loadCreateVitePlugins();
    const plugins = await createVitePlugins(config, true);

    // Should have built-in plugins
    expect(plugins.length).toBeGreaterThan(0);
  });

  it('handles undefined plugins array', async () => {
    const config: any = {
      root: cwd(),
      srcDir: '',
      // plugins not defined
      search: false,
      analytics: false,
    };

    const createVitePlugins = await loadCreateVitePlugins();
    const plugins = await createVitePlugins(config, true);

    // Should still return built-in plugins
    expect(plugins.length).toBeGreaterThan(0);
  });
});
