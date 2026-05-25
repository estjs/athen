import { describe, expect, it } from 'vitest';
import { resolveLocaleSiteData } from '../src/theme-default/hooks/localeSiteData';
import type { DefaultTheme } from '../src/shared/types';

const baseGuide: DefaultTheme.Config = {
  nav: [{ text: 'Guide', link: '/guide/' }],
  sidebar: {
    '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
  },
};

describe('resolveLocaleSiteData', () => {
  it('merges locale config over global theme defaults', () => {
    const themeConfig: DefaultTheme.Config = {
      ...baseGuide,
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
      sidebar: baseGuide.sidebar,
      editLink: { pattern: 'https://example.com/:path' },
      outlineTitle: 'On this page',
    });
  });

  it('returns global defaults when no locales are configured', () => {
    expect(resolveLocaleSiteData(baseGuide, '/guide/')).toMatchObject({
      nav: baseGuide.nav,
      sidebar: baseGuide.sidebar,
    });
  });

  it('deep-merges editLink so locale only needs to override text', () => {
    const themeConfig: DefaultTheme.Config = {
      editLink: { pattern: 'https://example.com/:path', text: 'Edit this page' },
      locales: {
        '/zh/': {
          label: '简体中文',
          editLink: { text: '在 GitHub 上编辑此页' } as DefaultTheme.EditLink,
        },
        '/': { label: 'English' },
      },
    };

    expect(resolveLocaleSiteData(themeConfig, '/zh/guide/').editLink).toEqual({
      pattern: 'https://example.com/:path',
      text: '在 GitHub 上编辑此页',
    });
    expect(resolveLocaleSiteData(themeConfig, '/guide/').editLink).toEqual({
      pattern: 'https://example.com/:path',
      text: 'Edit this page',
    });
  });
});
