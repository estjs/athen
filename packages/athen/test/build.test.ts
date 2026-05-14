import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const viteBuild = vi.fn();
const createVitePlugins = vi.fn(async () => []);

vi.mock('vite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vite')>();

  return {
    ...actual,
    build: viteBuild,
  };
});

vi.mock('../src/node/plugins', () => ({
  createVitePlugins,
}));

vi.mock('@/runtime', () => ({
  withBase(path: string, base = '/') {
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    return `${normalizedBase}${normalizedPath}`;
  },
}));

describe('production build bundling', () => {
  beforeEach(() => {
    viteBuild.mockReset();
    createVitePlugins.mockClear();
  });

  it('builds the SSG renderer as an SSR bundle and the browser runtime as a client bundle', async () => {
    const { bundle } = await import('../src/node/build');
    const { DIST_DIR, SSG_ENTRY_PATH, SSR_ENTRY_PATH } = await import('../src/node/constants');
    const root = '/project/docs';

    viteBuild.mockResolvedValueOnce({ output: [] }).mockResolvedValueOnce({ output: [] });

    await bundle(root, { root, plugins: [] });

    expect(viteBuild).toHaveBeenCalledTimes(2);
    expect(createVitePlugins).toHaveBeenNthCalledWith(1, { root, plugins: [] }, false);
    expect(viteBuild.mock.calls[0][0].build).toMatchObject({
      ssr: true,
      ssrEmitAssets: true,
      outDir: join(root, '.temp'),
      rollupOptions: {
        input: SSG_ENTRY_PATH,
      },
    });
    expect(viteBuild.mock.calls[0][0].define['import.meta.env.SSR']).toBe('true');
    expect(createVitePlugins).toHaveBeenNthCalledWith(2, { root, plugins: [] }, true);
    expect(viteBuild.mock.calls[1][0].build).toMatchObject({
      ssr: false,
      outDir: join(root, DIST_DIR),
      rollupOptions: {
        input: SSR_ENTRY_PATH,
      },
    });
    expect(viteBuild.mock.calls[1][0].define['import.meta.env.SSR']).toBe('false');
  });
});

describe('renderPage', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'athen-render-page-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('injects client CSS, SSG-emitted UnoCSS, and the browser runtime into prerendered HTML', async () => {
    const { renderPage } = await import('../src/node/build');
    const config = {
      base: '/docs/',
      siteData: {
        base: '/docs/',
        title: 'Athen',
        icon: '/logo.svg',
        head: [],
      },
    };
    const clientBundle = {
      output: [
        {
          type: 'chunk',
          fileName: 'assets/ssr-entry-client.js',
          isEntry: true,
        },
        {
          type: 'asset',
          fileName: 'assets/client-style.css',
        },
      ],
    };
    const ssgBundle = {
      output: [
        {
          type: 'chunk',
          fileName: 'ssg-entry.js',
          isEntry: true,
        },
        {
          type: 'asset',
          fileName: 'assets/uno.css',
        },
      ],
    };
    await mkdir(join(root, '.temp/assets'), { recursive: true });
    await writeFile(join(root, '.temp/assets/uno.css'), '.uno-utility{display:flex}');

    await (renderPage as any)(
      async () => '<main><h1>Rendered by SSG</h1><code>&lt;span&gt;</code></main>',
      root,
      clientBundle,
      ssgBundle,
      config,
      [{ path: '/en/' }],
    );

    const html = await readFile(join(root, 'dist/en/index.html'), 'utf8');

    expect(html).toContain(
      '<div id="app"><main><h1>Rendered by SSG</h1><code>&lt;span&gt;</code></main></div>',
    );
    expect(html).toContain('<link rel="stylesheet" href="/docs/assets/client-style.css">');
    expect(html).toContain('<link rel="stylesheet" href="/docs/assets/uno.css">');
    expect(html).toContain('<script type="module" src="/docs/assets/ssr-entry-client.js"></script>');
    await expect(readFile(join(root, 'dist/assets/uno.css'), 'utf8')).resolves.toBe(
      '.uno-utility{display:flex}',
    );
  });
});

describe('production UnoCSS entry', () => {
  it('imports UnoCSS from the SSG renderer instead of the browser runtime', async () => {
    const ssgEntry = await readFile(join(process.cwd(), 'packages/athen/src/runtime/ssg-entry.tsx'), 'utf8');
    const ssrEntry = await readFile(join(process.cwd(), 'packages/athen/src/runtime/ssr-entry.tsx'), 'utf8');

    expect(ssgEntry).toContain("import 'uno.css'");
    expect(ssrEntry).not.toContain("import 'uno.css'");
  });
});
