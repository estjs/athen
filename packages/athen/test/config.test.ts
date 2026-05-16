import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import {
  defineConfig,
  resolveConfig,
  resolveLocaleRedirectTarget,
  resolveSiteData,
} from '../src/node/config';
import { DEFAULT_THEME_PATH } from '../src/node/constants';

const writeProject = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'athen-config-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(root, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return root;
};

const getLangScript = (head: ReturnType<typeof resolveSiteData>['head']) =>
  head.find((item) => item[1]?.id === 'check-lang')?.[2] || '';

describe('config', () => {
  let root = '';

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('loads user config into internal config', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        title: 'Docs',
        description: 'Readable docs',
        search: { provider: 'flex' },
        plugins: [{ name: 'user-plugin' }]
      })`,
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config).toMatchObject({
      root,
      themeDir: DEFAULT_THEME_PATH,
      search: { provider: 'flex' },
      siteData: { title: 'Docs', description: 'Readable docs' },
    });
    expect(config.plugins?.[0]).toMatchObject({ name: 'user-plugin' });
  });

  it('loads advanced user config fields (vite, route, etc) into internal config', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        vite: { server: { port: 8080 } },
        route: { exclude: ['custom.tsx'] },
        outDir: 'dist-docs',
        tempDir: '.temp-docs',
        enableSpa: true,
        allowDeadLinks: true,
        srcDir: 'src-docs'
      })`,
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config.vite).toMatchObject({ server: { port: 8080 } });
    expect(config.route).toMatchObject({ exclude: ['custom.tsx'] });
    expect(config.outDir).toBe('dist-docs');
    expect(config.tempDir).toBe('.temp-docs');
    expect(config.enableSpa).toBe(true);
    expect(config.allowDeadLinks).toBe(true);
    expect(config.srcDir).toBe('src-docs');
  });

  it('loads shallow redesigned user config into internal config', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        title: 'New Docs',
        description: 'Modern docs',
        base: '/product/',
        favicon: '/favicon.svg',
        lang: 'en-US',
        srcDir: 'content',
        routeBasePath: 'reference',
        include: ['**/*.mdx'],
        exclude: ['drafts/**'],
        outDir: 'public-docs',
        tempDir: '.athen-temp',
        enableSpa: true,
        onBrokenLinks: 'throw',
        theme: './custom-theme',
        themeConfig: {
          nav: [{ text: 'Guide', link: '/guide/' }],
          sidebar: {
            '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }]
          },
          links: [{ icon: 'github', link: 'https://github.com/estjs/athen' }]
        },
        defaultLocale: 'en',
        locales: {
          '/': { label: 'English', lang: 'en-US' },
          '/zh/': { label: '简体中文', lang: 'zh-CN' }
        },
        markdown: {
          lineNumbers: true,
          remarkPlugins: [],
          rehypePlugins: []
        },
        vite: { server: { port: 8080 } }
      })`,
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config).toMatchObject({
      root,
      siteData: {
        title: 'New Docs',
        description: 'Modern docs',
        base: '/product/',
        icon: '/favicon.svg',
        lang: 'en-US',
      },
      route: {
        root: 'content',
        prefix: 'reference',
        include: ['**/*.mdx'],
        exclude: ['drafts/**'],
      },
      outDir: 'public-docs',
      tempDir: '.athen-temp',
      enableSpa: true,
      allowDeadLinks: false,
      onBrokenLinks: 'throw',
      srcDir: 'content',
      markdown: {
        lineNumbers: true,
        remarkPlugins: [],
        rehypePlugins: [],
      },
      vite: { server: { port: 8080 } },
    });
    expect(config.themeDir).toBe(join(root, 'custom-theme'));
    expect(config.siteData.themeConfig).toMatchObject({
      nav: [{ text: 'Guide', link: '/guide/' }],
      links: [{ icon: 'github', link: 'https://github.com/estjs/athen' }],
      locales: {
        '/': { label: 'English', lang: 'en-US' },
        '/zh/': { label: '简体中文', lang: 'zh-CN' },
      },
    });
  });

  it('keeps shallow config fields preferred over grouped compatibility fields', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        base: '/top/',
        lang: 'en-US',
        themeConfig: {
          nav: [{ text: 'Top Guide', link: '/guide/' }],
          sidebar: {
            '/top/': [{ text: 'Top', items: [{ text: 'Intro', link: '/top/' }] }]
          }
        },
        site: {
          base: '/grouped/',
          lang: 'zh-CN'
        },
        theme: {
          config: {
            nav: [{ text: 'Grouped Guide', link: '/grouped/' }],
            sidebar: {
              '/grouped/': [{ text: 'Grouped', items: [{ text: 'Intro', link: '/grouped/' }] }]
            }
          }
        }
      })`,
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config.siteData.base).toBe('/top/');
    expect(config.siteData.lang).toBe('en-US');
    expect(config.siteData.themeConfig).toMatchObject({
      nav: [{ text: 'Top Guide', link: '/guide/' }],
      sidebar: {
        '/top/': [{ text: 'Top', items: [{ text: 'Intro', link: '/top/' }] }],
      },
    });
    expect(config.siteData.themeConfig).not.toMatchObject({
      nav: [{ text: 'Grouped Guide', link: '/grouped/' }],
    });
  });

  it('resolves url policy fields from shallow config', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        cleanUrls: true,
        trailingSlash: false,
        rewrites: {
          '/old-guide': '/guide/getting-started'
        }
      })`,
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config.cleanUrls).toBe(true);
    expect(config.trailingSlash).toBe(false);
    expect(config.rewrites).toEqual({
      '/old-guide': '/guide/getting-started',
    });
  });

  it('resolves themeConfig.sidebar auto into generated sidebar data', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        themeConfig: {
          sidebar: 'auto'
        }
      })`,
      'guide/index.md': '# Guide',
      'guide/getting-started.md': '---\ntitle: Getting Started\n---\n# Start',
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config.siteData.themeConfig.sidebar).toEqual({
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Guide', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
    });
  });

  it('resolves locale sidebar auto under its locale prefix', async () => {
    root = writeProject({
      'athen.config.ts': `export default () => ({
        locales: {
          '/zh/': {
            label: '简体中文',
            lang: 'zh-CN',
            sidebar: 'auto'
          }
        }
      })`,
      'zh/guide/index.md': '# 指南',
      'zh/guide/getting-started.md': '# 快速开始',
    });

    const config = await resolveConfig(root, 'serve', 'development');

    expect(config.siteData.themeConfig.locales?.['/zh/'].sidebar).toEqual({
      '/zh/guide/': [
        {
          text: 'Zh Guide',
          items: [
            { text: '指南', link: '/zh/guide/' },
            { text: '快速开始', link: '/zh/guide/getting-started' },
          ],
        },
      ],
    });
  });

  it('reports missing config and keeps defineConfig as identity', async () => {
    root = writeProject({});
    await expect(resolveConfig(root, 'serve', 'development')).rejects.toThrow(
      `No athen config file found in ${root}`,
    );

    const userConfig = { title: 'Docs' };
    expect(defineConfig(userConfig)).toBe(userConfig);
  });

  it('creates site data with locale entries derived from themeConfig.locales', () => {
    const head = [['meta', { name: 'viewport', content: 'width=device-width' }]] as const;
    const siteData = resolveSiteData('/root', {
      head: [...head],
      themeConfig: {
        locales: {
          '/en/': { lang: 'en-US' },
          '/zh/': { lang: 'zh-CN' },
          '/fr/': { lang: 'fr-FR' },
        },
      },
      colorScheme: true,
    });
    const script = getLangScript(siteData.head);

    expect(head).toHaveLength(1);
    expect(siteData.head.some((item) => item[1]?.id === 'check-dark-light')).toBe(true);
    expect(script).toContain('"prefix":"en"');
    expect(script).toContain('"prefix":"zh"');
    expect(script).toContain('"prefix":"fr"');
    expect(script).not.toContain("includes('zh')");
  });

  it('creates site data with locale entries derived from top-level locales', () => {
    const siteData = resolveSiteData('/root', {
      base: '/docs/',
      title: 'Localized Docs',
      defaultLocale: 'en',
      locales: {
        '/en/': { label: 'English', lang: 'en-US' },
        '/zh/': { label: '简体中文', lang: 'zh-CN' },
      },
    });
    const script = getLangScript(siteData.head);

    expect(siteData.title).toBe('Localized Docs');
    expect(siteData.themeConfig.locales).toMatchObject({
      '/en/': { label: 'English', lang: 'en-US' },
      '/zh/': { label: '简体中文', lang: 'zh-CN' },
    });
    expect(script).toContain('var base = "/docs/"');
    expect(script).toContain('"prefix":"en"');
    expect(script).toContain('"prefix":"zh"');
  });

  it('matches browser languages to the best locale prefix', () => {
    const locales = [
      { prefix: 'en', lang: 'en-US' },
      { prefix: 'zh', lang: 'zh-CN' },
      { prefix: 'fr', lang: 'fr-FR' },
    ];

    expect(resolveLocaleRedirectTarget(['zh-HK', 'en-GB'], locales)).toBe('/zh/');
    expect(resolveLocaleRedirectTarget(['fr-CA'], locales)).toBe('/fr/');
    expect(resolveLocaleRedirectTarget(['de-DE'], locales)).toBe('/en/');
    expect(resolveLocaleRedirectTarget(['en-US'], locales, '/zh/')).toBe('/zh/');
  });

  it('emits a stored-language redirect when the default locale is rooted', () => {
    const siteData = resolveSiteData('/root', {
      lang: 'en-US',
      themeConfig: {
        locales: {
          '/': { lang: 'en' },
          '/zh/': { lang: 'zh' },
        },
      },
    });
    const script = getLangScript(siteData.head);

    expect(script).toContain('athen-locale');
    expect(script).toContain('"prefix":""');
    expect(script).toContain('"prefix":"zh"');
  });
});
