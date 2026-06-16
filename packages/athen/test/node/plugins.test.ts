import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';
import type { SiteConfig } from '../../src/shared/types';

const pluginMdxMock = vi.fn(() => ({ name: 'plugins-mdx' }));

vi.mock('@estjs/athen-plugin-mdx', () => ({ pluginMdx: pluginMdxMock }));
vi.mock('@estjs/athen-plugin-search', () => ({ default: () => ({ name: 'athen:search' }) }));
vi.mock('@estjs/athen-plugin-analytics', () => ({ default: () => ({ name: 'athen:analytics' }) }));
vi.mock('unocss/vite', () => ({ default: () => ({ name: 'unocss' }) }));
vi.mock('vite-plugin-environment', () => ({ default: () => ({ name: 'env' }) }));
vi.mock('vite-plugin-inspect', () => ({ default: () => ({ name: 'inspect' }) }));
vi.mock('../../src/node/plugins/core', () => ({
  pluginAthen: () => ({ name: 'athen:config' }),
  pluginRoute: () => ({ name: 'athen:routes' }),
}));
vi.mock('../../src/node/plugins/svgr', () => ({ pluginSvgr: () => ({ name: 'athen:svgr' }) }));
vi.mock('../../src/node/plugins/mdxHmr', () => ({
  pluginMdxHMR: () => ({ name: 'athen:mdx-hmr' }),
}));

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
      favicon: '',
      head: [],
      themeConfig: {},
      colorScheme: true,
    },
  };
}

const pluginNames = (plugins: unknown[]) =>
  plugins.flatMap((plugin) =>
    typeof plugin === 'object' && plugin && 'name' in plugin ? [String(plugin.name)] : [],
  );

describe('plugins', () => {
  it('passes site markdown configuration to the built-in MDX plugin', async () => {
    const { createVitePlugins } = await import('../../src/node/plugins');

    await createVitePlugins(
      {
        ...config(),
        enableSpa: true,
        markdown: {
          lineNumbers: true,
          remarkPlugins: [],
          rehypePlugins: [],
        },
      },
      true,
    );

    expect(pluginMdxMock).toHaveBeenCalledWith(
      expect.objectContaining({
        root: cwd(),
        base: '',
        essor: true,
        enableSpa: true,
        lineNumbers: true,
        remarkPlugins: [],
        rehypePlugins: [],
      }),
    );
  });

  it('keeps user plugins first, supports built-in replacement, and only adds inspect on server', async () => {
    const { createVitePlugins } = await import('../../src/node/plugins');
    const userRoute: Plugin = { name: 'athen:routes' };

    const server = await createVitePlugins(config([userRoute]), true);
    const client = await createVitePlugins(config(), false);

    expect(server[0]).toBe(userRoute);
    expect(pluginNames(server).filter((name) => name === 'athen:routes')).toHaveLength(1);
    expect(pluginNames(server)).toContain('inspect');
    expect(pluginNames(client)).not.toContain('inspect');
  });
});

describe('pluginAthen', () => {
  it('aliases essor/server to the server entry at the package root', async () => {
    vi.doUnmock('../../src/node/plugins/core');
    const { pluginAthen } = await import('../../src/node/plugins/core');
    const plugins = pluginAthen(config());
    const pluginConfig = plugins.find((plugin) => plugin.name === 'athen:config');
    const viteConfig = (pluginConfig?.config as () => any)();
    const aliases = viteConfig.resolve.alias as Array<{ find: string | RegExp; replacement: string }>;
    const essorServerAlias = aliases.find((alias) => alias.find === 'essor/server');
    const essorAliasIndex = aliases.findIndex((alias) => alias.find === 'essor');
    const essorServerAliasIndex = aliases.findIndex((alias) => alias.find === 'essor/server');

    const require = createRequire(import.meta.url);
    const essorPackageRoot = dirname(
      require.resolve('essor/package.json', { paths: [cwd(), join(cwd(), 'packages/athen')] }),
    );

    expect(essorServerAlias?.replacement).toBe(join(essorPackageRoot, 'server/index.js'));
    expect(essorServerAliasIndex).toBeGreaterThanOrEqual(0);
    expect(essorServerAliasIndex).toBeLessThan(essorAliasIndex);
  });

  it('uses the latest route table when transforming dev HTML', async () => {
    vi.doUnmock('../../src/node/plugins/core');
    const { pluginAthen } = await import('../../src/node/plugins/core');
    const siteConfig = config();
    siteConfig.siteData.title = 'Docs';
    siteConfig._routes = [
      {
        routePath: '/guide',
        absolutePath: '/fake/old.md',
        filePath: 'old.md',
        title: 'Old Title',
      },
    ];
    const indexHtmlPlugin = pluginAthen(siteConfig).find((plugin) => plugin.name === 'athen:index-html');
    const transformIndexHtml = indexHtmlPlugin?.transformIndexHtml as {
      handler: (html: string, ctx: { originalUrl?: string }) => { html: string };
    };

    siteConfig._routes = [
      {
        routePath: '/guide',
        absolutePath: '/fake/new.md',
        filePath: 'new.md',
        title: 'New Title',
      },
    ];

    const out = transformIndexHtml.handler('<html><head></head><body></body></html>', {
      originalUrl: '/guide',
    });

    expect(out.html).toContain('<title>New Title | Docs</title>');
    expect(out.html).not.toContain('Old Title');
  });

  it('invalidates both routes and site data virtual modules when route files are added', async () => {
    vi.doUnmock('../../src/node/plugins/core');
    const { pluginRoute } = await import('../../src/node/plugins/core');
    const routePlugin = pluginRoute({
      ...config(),
      root: '/project/docs',
      _routes: [],
    });
    const handlers: Record<string, (file: string) => void> = {};
    const routeModule = { id: '\0athen:routes' };
    const siteDataModule = { id: '\0athen:site-data' };
    const invalidated: unknown[] = [];

    routePlugin.configureServer?.({
      watcher: {
        on(event: string, cb: (file: string) => void) {
          handlers[event] = cb;
        },
      },
      moduleGraph: {
        getModuleById(id: string) {
          if (id === '\0athen:routes') return routeModule;
          if (id === '\0athen:site-data') return siteDataModule;
        },
        invalidateModule(mod: unknown) {
          invalidated.push(mod);
        },
      },
      ws: {
        send: vi.fn(),
      },
    } as any);

    handlers.add('/project/docs/guide/new.md');

    expect(invalidated).toContain(routeModule);
    expect(invalidated).toContain(siteDataModule);
  });
});
