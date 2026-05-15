import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SiteConfig } from '../src/shared/types';

const viteBuild = vi.fn();
const createVitePlugins = vi.fn(async () => []);

vi.mock('vite', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vite')>()),
  build: viteBuild,
}));
vi.mock('../src/node/plugins', () => ({ createVitePlugins }));
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
    icon: '/logo.svg',
    head: [],
    themeConfig: {},
    colorScheme: true,
    ...siteData,
  },
});

describe('build', () => {
  beforeEach(() => {
    viteBuild.mockReset();
    createVitePlugins.mockClear();
  });

  it('builds SSG and browser bundles with the right entries', async () => {
    const { bundle } = await import('../src/node/build');
    const { DIST_DIR, SSG_ENTRY_PATH, SSR_ENTRY_PATH } = await import('../src/node/constants');
    const root = '/project/docs';
    viteBuild.mockResolvedValue({ output: [] });

    await bundle(root, config(root));

    expect(viteBuild.mock.calls.map(([item]) => item.build)).toMatchObject([
      { ssr: true, outDir: join(root, '.temp'), rollupOptions: { input: SSG_ENTRY_PATH } },
      { ssr: false, outDir: join(root, DIST_DIR), rollupOptions: { input: SSR_ENTRY_PATH } },
    ]);
    expect(createVitePlugins.mock.calls.map(([, isClient]) => isClient)).toEqual([false, true]);
  });

  it('renders HTML with configured head, base assets, and copied CSS', async () => {
    const { renderPage } = await import('../src/node/build');
    const root = await mkdtemp(join(tmpdir(), 'athen-render-'));
    try {
      await mkdir(join(root, '.temp/assets'), { recursive: true });
      await writeFile(join(root, '.temp/assets/uno.css'), '.uno{}');

      await renderPage(
        async () => '<main>Docs</main>',
        root,
        { output: [{ type: 'chunk', fileName: 'assets/app.js', isEntry: true }] },
        { output: [{ type: 'asset', fileName: 'assets/uno.css' }] },
        config(root, {
          base: '/docs/',
          description: 'Readable docs',
          head: [['meta', { name: 'theme-color', content: '#fff' }]],
        }),
        [{ path: '/guide/', component: {}, meta: {}, preload: async () => ({}) }],
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
});
