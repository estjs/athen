import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, it, vi } from 'vitest';
import type { Plugin, UserConfig } from 'vite';
import type { SiteConfig } from '../src/shared/types';

const require = createRequire(import.meta.url);

vi.mock('@athen/plugin-mdx', () => ({ pluginMdx: () => ({ name: 'plugins-mdx' }) }));
vi.mock('@athen/plugin-search', () => ({ default: () => ({ name: 'athen:search' }) }));
vi.mock('@athen/plugin-analytics', () => ({ default: () => ({ name: 'athen:analytics' }) }));
vi.mock('unocss/vite', () => ({ default: () => ({ name: 'unocss' }) }));
vi.mock('vite-plugin-environment', () => ({ default: () => ({ name: 'env' }) }));
vi.mock('vite-plugin-inspect', () => ({ default: () => ({ name: 'inspect' }) }));
vi.mock('../src/node/plugins/router', () => ({ default: () => ({ name: 'athen:routes' }) }));
vi.mock('../src/node/plugins/athen', () => ({ pluginAthen: () => ({ name: 'athen:config' }) }));
vi.mock('../src/node/plugins/svgr', () => ({ pluginSvgr: () => ({ name: 'athen:svgr' }) }));
vi.mock('../src/node/plugins/mdxHmr', () => ({ pluginMdxHMR: () => ({ name: 'athen:mdx-hmr' }) }));

function config(plugins?: Plugin[]): SiteConfig {
  return {
    root: cwd(),
    configPath: '/fake/athen.config.ts',
    themeDir: '/fake/theme',
    plugins,
    siteData: {
      root: cwd(),
      base: '',
      lang: 'en-US',
      title: '',
      description: '',
      icon: '',
      head: [],
      themeConfig: {},
      colorScheme: true,
    },
  };
}

const pluginNames = (plugins: unknown[]) =>
  plugins.flatMap(plugin =>
    typeof plugin === 'object' && plugin && 'name' in plugin ? [String(plugin.name)] : [],
  );

describe('plugins', () => {
  it('keeps user plugins first, supports built-in replacement, and only adds inspect on server', async () => {
    const { createVitePlugins } = await import('../src/node/plugins');
    const userRoute: Plugin = { name: 'athen:routes' };

    const server = await createVitePlugins(config([userRoute]), true);
    const client = await createVitePlugins(config(), false);

    expect(server[0]).toBe(userRoute);
    expect(pluginNames(server).filter(name => name === 'athen:routes')).toHaveLength(1);
    expect(pluginNames(server)).toContain('inspect');
    expect(pluginNames(client)).not.toContain('inspect');
  });

  it('switches Essor aliases between browser runtime and SSG shims', async () => {
    type Alias = NonNullable<NonNullable<UserConfig['resolve']>['alias']>[number];
    const { pluginConfig } = await import('../src/node/plugins/athen/config');
    const { SSG_ROUTER_PATH, SSG_SERVER_PATH } = await import('../src/node/constants');
    const essor = dirname(require.resolve('essor', { paths: [join(cwd(), 'packages/athen')] }));
    const router = dirname(
      require.resolve('essor-router', { paths: [join(cwd(), 'packages/athen')] }),
    );
    const find = (aliases: Alias[], id: string) =>
      aliases.find(alias =>
        typeof alias.find === 'string' ? alias.find === id : alias.find.test(id),
      )?.replacement;
    const aliases = (isClient: boolean) =>
      (pluginConfig(config(), undefined, isClient) as Plugin & { config: () => UserConfig })
        .config()
        .resolve?.alias as Alias[];

    expect(find(aliases(true), 'essor/server')).toBe(join(essor, 'server.esm.js'));
    expect(find(aliases(true), 'essor-router')).toBe(join(router, 'index.mjs'));
    expect(find(aliases(false), 'essor/server')).toBe(SSG_SERVER_PATH);
    expect(find(aliases(false), 'essor-router')).toBe(SSG_ROUTER_PATH);
  });
});
