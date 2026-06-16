import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHead } from 'unhead/server';
import type { SiteConfig } from '../../src/shared/types';

const viteBuild = vi.fn();
const createVitePlugins = vi.fn(() => Promise.resolve([]));

vi.mock('vite', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vite')>()),
  build: viteBuild,
}));
vi.mock('../../src/node/plugins', () => ({ createVitePlugins }));
vi.mock('@/runtime', () => ({
  withBase: (file: string, base = '/') =>
    `${base === '/' ? '' : base.replace(/\/$/, '')}/${file.replace(/^\//, '')}`,
}));

const config = (root: string, siteData: Partial<SiteConfig['siteData']> = {}): SiteConfig => ({
  root,
  configPath: '/fake/athen.config.ts',
  themeDir: '/fake/theme',
  siteData: {
    root,
    base: '',
    lang: 'en-US',
    title: 'Athen',
    description: 'Athen docs',
    favicon: '/logo.svg',
    head: [],
    themeConfig: {},
    colorScheme: true,
    ...siteData,
  },
});

// The `render` function returned by the SSG bundle returns { html, head }.
// In tests we want full control over what gets injected, so the test render
// returns a fresh server-side Unhead instance (the build's `useHead` call then
// layers route metadata on top of that empty entry).
const stubRender = (html: string) => () => Promise.resolve({ html, head: createHead() });

describe('build', () => {
  beforeEach(() => {
    viteBuild.mockReset();
    createVitePlugins.mockClear();
  });

  it('builds SSG and browser bundles with the right entries', async () => {
    const { bundle } = await import('../../src/node/build');
    const {
      BROWSER_BUILD_TARGET,
      CLIENT_ENTRY_PATH,
      DEFAULT_OUT_DIR,
      DEFAULT_TEMP_DIR,
      SSG_ENTRY_PATH,
    } = await import('../../src/node/constants');
    const root = '/project/docs';
    viteBuild.mockResolvedValue({ output: [] });

    await bundle(root, config(root));

    expect(viteBuild.mock.calls.map(([item]) => item.build)).toMatchObject([
      {
        ssr: true,
        outDir: join(root, DEFAULT_TEMP_DIR),
        rollupOptions: { input: SSG_ENTRY_PATH },
      },
      {
        ssr: false,
        outDir: join(root, DEFAULT_OUT_DIR),
        rollupOptions: { input: CLIENT_ENTRY_PATH },
      },
    ]);
    expect(createVitePlugins.mock.calls.map(([, isClient]) => isClient)).toEqual([false, true]);
    expect(viteBuild.mock.calls.map(([item]) => item.build.target)).toEqual([
      BROWSER_BUILD_TARGET,
      BROWSER_BUILD_TARGET,
    ]);
  });

  it('honors a custom config.outDir for both the SSR build and the final dist path', async () => {
    const { bundle } = await import('../../src/node/build');
    const { CLIENT_ENTRY_PATH, SSG_ENTRY_PATH } = await import('../../src/node/constants');
    const root = '/project/docs';
    viteBuild.mockResolvedValue({ output: [] });

    await bundle(root, { ...config(root), outDir: 'build', tempDir: '.cache' });

    expect(viteBuild.mock.calls.map(([item]) => item.build)).toMatchObject([
      {
        ssr: true,
        outDir: join(root, '.cache'),
        rollupOptions: { input: SSG_ENTRY_PATH },
      },
      {
        ssr: false,
        outDir: join(root, 'build'),
        rollupOptions: { input: CLIENT_ENTRY_PATH },
      },
    ]);
  });

  it('renders HTML with configured head, base assets, and copied CSS', async () => {
    const { renderPage } = await import('../../src/node/build');
    const root = await mkdtemp(join(tmpdir(), 'athen-render-'));
    try {
      await mkdir(join(root, '.temp/assets'), { recursive: true });
      await writeFile(join(root, '.temp/assets/uno.css'), '.uno{}');

      await renderPage(
        stubRender('<main>Docs</main>'),
        root,
        { output: [{ type: 'chunk', fileName: 'assets/app.js', isEntry: true }] },
        { output: [{ type: 'asset', fileName: 'assets/uno.css' }] },
        config(root, {
          base: '/docs/',
          description: 'Readable docs',
          head: [['meta', { name: 'theme-color', content: '#fff' }]],
        }),
        [{ path: '/guide/', component: {}, meta: {}, preload: () => Promise.resolve({}) }],
      );

      const html = await readFile(join(root, 'dist/guide/index.html'), 'utf8');
      expect(html).toContain('<div id="app"><main>Docs</main></div>');
      expect(html).toContain('<meta name="description" content="Readable docs">');
      expect(html).toContain('href="/docs/assets/uno.css"');
      expect(html).toContain('src="/docs/assets/app.js"');
      await expect(readFile(join(root, 'dist/assets/uno.css'), 'utf8')).resolves.toBe('.uno{}');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('writes per-route title, description, and html lang into each page', async () => {
    const { renderPage } = await import('../../src/node/build');
    const root = await mkdtemp(join(tmpdir(), 'athen-meta-'));
    try {
      await mkdir(join(root, '.temp/assets'), { recursive: true });

      await renderPage(
        stubRender('<main>Body</main>'),
        root,
        { output: [{ type: 'chunk', fileName: 'assets/app.js', isEntry: true }] },
        { output: [] },
        config(root, {
          description: 'Default desc',
          locales: {
            '': { label: 'English', lang: 'en' },
            'zh': { label: '简体中文', lang: 'zh', description: '中文站点描述' },
          },
        }),
        [
          {
            path: '/guide/',
            component: {},
            meta: {},
            preload: () => Promise.resolve({}),
            title: 'Quick Start',
            description: 'Page-specific description',
            lang: 'en',
            localePrefix: '',
          },
          {
            path: '/zh/guide/',
            component: {},
            meta: {},
            preload: () => Promise.resolve({}),
            title: '快速开始',
            lang: 'zh',
            localePrefix: 'zh',
          },
        ],
      );

      const en = await readFile(join(root, 'dist/guide/index.html'), 'utf8');
      expect(en).toMatch(/<html lang="en">/);
      expect(en).toContain('<title>Quick Start | Athen</title>');
      expect(en).toContain('<meta name="description" content="Page-specific description">');

      const zh = await readFile(join(root, 'dist/zh/guide/index.html'), 'utf8');
      expect(zh).toMatch(/<html lang="zh">/);
      expect(zh).toContain('<title>快速开始 | Athen</title>');
      // No page description on the zh route → falls back to locale description.
      expect(zh).toContain('<meta name="description" content="中文站点描述">');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
