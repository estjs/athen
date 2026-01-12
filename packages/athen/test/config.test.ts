import { tmpdir } from 'node:os';
import { join, resolve as pathResolve } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import { defineConfig, resolveConfig, resolveSiteData } from '../src/node/config';
import { DEFAULT_THEME_PATH } from '../src/node/constants';

function createTempProject(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'athen-config-test-'));
  for (const [relative, content] of Object.entries(files)) {
    const filePath = join(dir, relative);
    mkdirSync(pathResolve(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
  }
  return dir;
}

describe('resolveConfig', () => {
  let tempDir: string | null = null;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it('should use default theme when none specified', async () => {
    tempDir = createTempProject({
      'athen.config.js': `module.exports = {};`,
    });

    const config = await resolveConfig(tempDir, 'serve', 'development');
    expect(config.themeDir).toBe(DEFAULT_THEME_PATH);
  });

  it('should resolve theme path relative to project root', async () => {
    tempDir = createTempProject({
      'athen.config.js': `module.exports = { theme: 'my-theme' };`,
    });
    mkdirSync(join(tempDir, 'my-theme'), { recursive: true });

    const config = await resolveConfig(tempDir, 'serve', 'development');
    expect(config.themeDir).toBe(pathResolve(tempDir, 'my-theme'));
  });

  it('should set root in config', async () => {
    tempDir = createTempProject({
      'athen.config.js': `module.exports = {};`,
    });

    const config = await resolveConfig(tempDir, 'serve', 'development');
    expect(config.root).toBe(tempDir);
  });

  it('should set configPath in config', async () => {
    tempDir = createTempProject({
      'athen.config.ts': `export default {};`,
    });

    const config = await resolveConfig(tempDir, 'serve', 'development');
    expect(config.configPath).toContain('athen.config.ts');
  });

  it('should resolve siteData with defaults', async () => {
    tempDir = createTempProject({
      'athen.config.js': `module.exports = {};`,
    });

    const config = await resolveConfig(tempDir, 'serve', 'development');
    expect(config.siteData.lang).toBe('en-US');
    expect(config.siteData.title).toBe('Athen');
    expect(config.siteData.description).toBe('Athen');
  });

  it('should use custom title and description', async () => {
    tempDir = createTempProject({
      'athen.config.js': `module.exports = { title: 'My Site', description: 'My Description' };`,
    });

    const config = await resolveConfig(tempDir, 'serve', 'development');
    expect(config.siteData.title).toBe('My Site');
    expect(config.siteData.description).toBe('My Description');
  });

  it('should throw error when no config file found', async () => {
    tempDir = createTempProject({});

    await expect(resolveConfig(tempDir, 'serve', 'development')).rejects.toThrow();
  });
});

describe('resolveSiteData', () => {
  it('should return default values for empty config', () => {
    const siteData = resolveSiteData('/root', {});

    expect(siteData.lang).toBe('en-US');
    expect(siteData.title).toBe('Athen');
    expect(siteData.description).toBe('Athen');
    expect(siteData.base).toBe('');
    expect(siteData.icon).toBe('');
    expect(siteData.colorScheme).toBe(true);
  });

  it('should use provided values', () => {
    const siteData = resolveSiteData('/root', {
      lang: 'zh-CN',
      title: 'Custom Title',
      description: 'Custom Description',
      base: '/docs/',
      icon: '/favicon.ico',
    });

    expect(siteData.lang).toBe('zh-CN');
    expect(siteData.title).toBe('Custom Title');
    expect(siteData.description).toBe('Custom Description');
    expect(siteData.base).toBe('/docs/');
    expect(siteData.icon).toBe('/favicon.ico');
  });

  it('should include dark mode script when colorScheme is enabled', () => {
    const siteData = resolveSiteData('/root', { colorScheme: true });

    const darkModeScript = siteData.head.find(
      h => h[0] === 'script' && h[1]?.id === 'check-dark-light',
    );
    expect(darkModeScript).toBeDefined();
  });

  it('should not include dark mode script when colorScheme is disabled', () => {
    const siteData = resolveSiteData('/root', { colorScheme: false });

    const darkModeScript = siteData.head.find(
      h => h[0] === 'script' && h[1]?.id === 'check-dark-light',
    );
    expect(darkModeScript).toBeUndefined();
  });

  it('should include lang redirect script when langs configured', () => {
    const siteData = resolveSiteData('/root', { langs: ['zh', 'en'] });

    const langScript = siteData.head.find(h => h[0] === 'script' && h[1]?.id === 'check-lang');
    expect(langScript).toBeDefined();
  });

  it('should pass through themeConfig', () => {
    const themeConfig = { nav: [], sidebar: {} };
    const siteData = resolveSiteData('/root', { themeConfig });

    expect(siteData.themeConfig).toBe(themeConfig);
  });

  it('should handle search config', () => {
    const searchConfig = {
      provider: 'algolia' as const,
      algolia: { appId: 'test', apiKey: 'test', indexName: 'test' },
    };
    const siteData = resolveSiteData('/root', { search: searchConfig });

    expect(siteData.search).toBe(searchConfig);
  });
});

describe('defineConfig', () => {
  it('should return the same config object', () => {
    const config = { title: 'Test' };
    const result = defineConfig(config);

    expect(result).toBe(config);
  });

  it('should work with complex config', () => {
    const config = {
      title: 'Test',
      description: 'Description',
      themeConfig: {
        nav: [{ text: 'Home', link: '/' }],
      },
    };
    const result = defineConfig(config);

    expect(result).toEqual(config);
  });
});
