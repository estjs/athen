import { describe, expect, it } from 'vitest';
import { resolveLocaleSiteData } from '../src/theme-default/hooks/localeSiteData';
import type { DefaultTheme } from '../src/shared/types';

describe('resolveLocaleSiteData', () => {
  it('merges locale config over global theme defaults', () => {
    const themeConfig: DefaultTheme.Config = {
      nav: [{ text: 'Guide', link: '/guide/' }],
      sidebar: {
        '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
      },
      editLink: { pattern: 'https://example.com/:path' },
      outlineTitle: 'On this page',
      locales: {
        '/zh/': {
          label: '简体中文',
          lang: 'zh-CN',
          title: '中文',
          nav: [{ text: '指南', link: '/zh/guide/' }],
        },
      },
    };

    expect(resolveLocaleSiteData(themeConfig, '/zh/guide/')).toMatchObject({
      langRoutePrefix: '/zh/',
      title: '中文',
      nav: [{ text: '指南', link: '/zh/guide/' }],
      sidebar: {
        '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
      },
      editLink: { pattern: 'https://example.com/:path' },
      outlineTitle: 'On this page',
    });
  });

  it('returns global defaults when no locales are configured', () => {
    const themeConfig: DefaultTheme.Config = {
      nav: [{ text: 'Guide', link: '/guide/' }],
      sidebar: {
        '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
      },
    };

    expect(resolveLocaleSiteData(themeConfig, '/guide/')).toMatchObject({
      nav: [{ text: 'Guide', link: '/guide/' }],
      sidebar: {
        '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
      },
    });
  });
});
