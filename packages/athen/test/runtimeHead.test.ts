import { describe, expect, it } from 'vitest';
import { resolveHeadInput } from '../src/runtime/head';
import type { FrontMatterMeta, PageData, SiteData } from '../src/shared/types';

const siteData: SiteData = {
  root: '/',
  base: '/',
  lang: 'en',
  title: 'Athen',
  description: 'Site description',
  favicon: '/favicon.ico',
  head: [],
  colorScheme: true,
};

function page(partial: Partial<PageData> & { lang?: string }): PageData {
  return {
    siteData,
    pagePath: '/',
    relativePagePath: '',
    routePath: '/',
    pageType: 'doc',
    ...partial,
  };
}

describe('runtime resolveHeadInput', () => {
  it('uses frontmatter.title with priority over pageData.title', () => {
    const out = resolveHeadInput(
      page({ title: 'PageDataTitle', frontmatter: { title: 'FmTitle' } as FrontMatterMeta }),
    );
    expect(out.title).toBe('FmTitle | Athen');
  });

  it('falls back to pageData.title when frontmatter.title is missing', () => {
    const out = resolveHeadInput(page({ title: 'PageDataTitle' }));
    expect(out.title).toBe('PageDataTitle | Athen');
  });

  it('drops to site title when no page title anywhere', () => {
    const out = resolveHeadInput(page({}));
    expect(out.title).toBe('Athen');
  });

  it('frontmatter.description wins over pageData.description and siteData', () => {
    const out = resolveHeadInput(
      page({
        description: 'PageDesc',
        frontmatter: { description: 'FmDesc' } as FrontMatterMeta,
      }),
    );
    expect(out.meta[0].content).toBe('FmDesc');
  });

  it('falls back to siteData.description when no page description', () => {
    expect(resolveHeadInput(page({})).meta[0].content).toBe('Site description');
  });

  it('honors pageData.lang and falls back to siteData.lang', () => {
    expect(resolveHeadInput(page({ lang: 'zh' })).htmlAttrs.lang).toBe('zh');
    expect(resolveHeadInput(page({})).htmlAttrs.lang).toBe('en');
  });

  it('uses locale lang over siteData.lang when route matches a locale prefix', () => {
    const i18nSiteData: SiteData = {
      ...siteData,
      lang: 'en-US',
      locales: {
        '/': { label: 'English', lang: 'en' },
        '/zh/': { label: '简体中文', lang: 'zh' },
      },
    };
    const zhPage = page({
      routePath: '/zh/guide/getting-started',
      siteData: i18nSiteData,
    });
    expect(resolveHeadInput(zhPage).htmlAttrs.lang).toBe('zh');

    const enPage = page({
      routePath: '/guide/getting-started',
      siteData: i18nSiteData,
    });
    expect(resolveHeadInput(enPage).htmlAttrs.lang).toBe('en');
  });

  it('falls back through locale description chain', () => {
    const i18nSiteData: SiteData = {
      ...siteData,
      locales: {
        '/zh/': { label: '简体中文', lang: 'zh', description: 'Locale desc' },
      },
    };
    const zhPage = page({
      routePath: '/zh/guide/getting-started',
      siteData: i18nSiteData,
    });
    expect(resolveHeadInput(zhPage).meta[0].content).toBe('Locale desc');
  });
});
