import { describe, expect, it } from 'vitest';
import {
  getDefaultLocaleSourcePrefix,
  getLocaleRedirectEntries,
  normalizeLanguageTag,
  normalizeLocalePrefix,
  stripLocalePrefix,
} from '../src/shared/locale';

describe('locale helpers', () => {
  it('normalizes locale prefixes and language tags consistently', () => {
    expect(normalizeLocalePrefix('/EN/')).toBe('en');
    expect(normalizeLocalePrefix('zh-CN/')).toBe('zh-cn');
    expect(normalizeLanguageTag('zh_CN')).toBe('zh-cn');
  });

  it('derives locale redirect entries from theme locales first', () => {
    const entries = getLocaleRedirectEntries({
      langs: ['fr'],
      themeConfig: {
        locales: {
          '/': { lang: 'en-US' },
          '/zh/': { lang: 'zh-CN' },
        },
      },
    });

    expect(entries).toEqual([
      { prefix: '', lang: 'en-us' },
      { prefix: 'zh', lang: 'zh-cn' },
    ]);
  });

  it('finds the source folder for a rooted default locale', () => {
    expect(
      getDefaultLocaleSourcePrefix({
        lang: 'en-US',
        themeConfig: {
          locales: {
            '/': { lang: 'en-US' },
            '/zh/': { lang: 'zh-CN' },
          },
        },
      }),
    ).toBe('/en/');
  });

  it('removes only the default locale source prefix from paths', () => {
    expect(stripLocalePrefix('/en/guide/getting-started', '/en/')).toBe('/guide/getting-started');
    expect(stripLocalePrefix('/zh/guide/getting-started', '/en/')).toBe(
      '/zh/guide/getting-started',
    );
    expect(stripLocalePrefix('/en/', '/en/')).toBe('/');
  });
});
