import { describe, expect, it } from 'vitest';
import { resolveLocaleSiteData } from '../../../src/theme-default/hooks/localeSiteData';
import type { EditLink, SiteData } from '../../../src/shared/types';

const baseSite = (extras?: Partial<SiteData>): SiteData => ({
  root: '/tmp',
  base: '',
  lang: 'en-US',
  title: 'Site',
  description: '',
  favicon: '',
  head: [],
  colorScheme: true,
  nav: [{ text: 'Guide', link: '/guide/' }],
  sidebar: {
    '/guide/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
  },
  ...extras,
});

describe('resolveLocaleSiteData', () => {
  it('merges locale config over global defaults', () => {
    const siteData = baseSite({
      editLink: { pattern: 'https://example.com/:path' },
      outlineTitle: 'On this page',
      locales: {
        '/zh/': {
          label: '简体中文',
          lang: 'zh-CN',
          langRoutePrefix: '/zh/',
          title: '中文',
          nav: [{ text: '指南', link: '/zh/guide/' }],
        },
      },
    });

    expect(resolveLocaleSiteData(siteData, '/zh/guide/')).toMatchObject({
      langRoutePrefix: '/zh/',
      title: '中文',
      nav: [{ text: '指南', link: '/zh/guide/' }],
      sidebar: siteData.sidebar,
      editLink: { pattern: 'https://example.com/:path' },
      outlineTitle: 'On this page',
    });
  });

  it('returns global defaults when no locales are configured', () => {
    const siteData = baseSite();
    expect(resolveLocaleSiteData(siteData, '/guide/')).toMatchObject({
      nav: siteData.nav,
      sidebar: siteData.sidebar,
    });
  });

  it('deep-merges editLink so locale only needs to override text', () => {
    const siteData = baseSite({
      editLink: { pattern: 'https://example.com/:path', text: 'Edit this page' },
      locales: {
        '/zh/': {
          label: '简体中文',
          langRoutePrefix: '/zh/',
          editLink: { text: '在 GitHub 上编辑此页' } as EditLink,
        },
        '/': { label: 'English', langRoutePrefix: '/' },
      },
    });

    expect(resolveLocaleSiteData(siteData, '/zh/guide/').editLink).toEqual({
      pattern: 'https://example.com/:path',
      text: '在 GitHub 上编辑此页',
    });
    expect(resolveLocaleSiteData(siteData, '/guide/').editLink).toEqual({
      pattern: 'https://example.com/:path',
      text: 'Edit this page',
    });
  });
});
