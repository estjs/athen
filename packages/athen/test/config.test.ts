import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
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
    writeFileSync(join(root, file), content);
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
