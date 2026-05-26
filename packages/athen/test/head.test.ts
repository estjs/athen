import { describe, expect, it } from 'vitest';
import {
  composeHeadInput,
  formatPageTitle,
  humanize,
  resolveServerPageHead,
} from '../src/shared/title';
import type { SiteData } from '../src/shared/types';

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

describe('formatPageTitle', () => {
  it('returns siteTitle alone when page is empty', () => {
    expect(formatPageTitle('', 'Athen')).toBe('Athen');
    expect(formatPageTitle(null, 'Athen')).toBe('Athen');
  });

  it('returns pageTitle alone when site is empty', () => {
    expect(formatPageTitle('Quick Start', '')).toBe('Quick Start');
  });

  it('collapses to one when both equal (no "Athen | Athen")', () => {
    expect(formatPageTitle('Athen', 'Athen')).toBe('Athen');
  });

  it('joins with " | " when both differ', () => {
    expect(formatPageTitle('Quick Start', 'Athen')).toBe('Quick Start | Athen');
  });
});

describe('humanize', () => {
  it('title-cases kebab and snake names', () => {
    expect(humanize('getting-started')).toBe('Getting Started');
    expect(humanize('api_reference')).toBe('Api Reference');
  });
});

describe('composeHeadInput', () => {
  it('picks page > locale > site for each field', () => {
    const out = composeHeadInput({
      pageTitle: 'Page',
      pageDescription: 'Page desc',
      pageLang: 'fr',
      localeTitle: 'Locale',
      localeDescription: 'Locale desc',
      localeLang: 'zh',
      siteTitle: 'Site',
      siteDescription: 'Site desc',
      siteLang: 'en',
    });
    expect(out.title).toBe('Page | Locale');
    expect(out.htmlAttrs.lang).toBe('fr');
    expect(out.meta).toEqual([{ name: 'description', content: 'Page desc' }]);
  });

  it('falls back through locale to site', () => {
    const out = composeHeadInput({
      localeTitle: undefined,
      siteTitle: 'Site',
      localeDescription: 'Locale desc',
      siteLang: 'en',
    });
    expect(out.title).toBe('Site');
    expect(out.meta[0].content).toBe('Locale desc');
    expect(out.htmlAttrs.lang).toBe('en');
  });

  it('defaults lang to "en" when nothing supplied', () => {
    expect(composeHeadInput({}).htmlAttrs.lang).toBe('en');
  });

  it('defaults site to "Athen" when nothing supplied', () => {
    expect(composeHeadInput({}).title).toBe('Athen');
  });

  it('skips empty-string fields as if undefined', () => {
    const out = composeHeadInput({
      pageTitle: '   ',
      siteTitle: 'Site',
      pageDescription: '',
      siteDescription: 'Site desc',
    });
    expect(out.title).toBe('Site');
    expect(out.meta[0].content).toBe('Site desc');
  });

  it('emits empty meta array when no description anywhere', () => {
    expect(composeHeadInput({ siteTitle: 'Site' }).meta).toEqual([]);
  });

  it('passes through BCP-47 language tags unchanged', () => {
    expect(composeHeadInput({ pageLang: 'zh-CN' }).htmlAttrs.lang).toBe('zh-CN');
  });
});

describe('resolveServerPageHead', () => {
  it('site-only: produces site title and site lang', () => {
    const out = resolveServerPageHead(siteData, undefined, undefined);
    expect(out.title).toBe('Athen');
    expect(out.htmlAttrs.lang).toBe('en');
    expect(out.meta[0].content).toBe('Site description');
  });

  it('locale overrides site title/description/lang', () => {
    const out = resolveServerPageHead(siteData, undefined, {
      title: 'Athen 中文',
      description: '中文站点描述',
      lang: 'zh',
    });
    expect(out.title).toBe('Athen 中文');
    expect(out.htmlAttrs.lang).toBe('zh');
    expect(out.meta[0].content).toBe('中文站点描述');
  });

  it('per-route page overrides locale & site', () => {
    const out = resolveServerPageHead(
      siteData,
      { title: 'Quick Start', description: 'Page desc', lang: 'en-US' },
      { title: 'Locale Title', description: 'Locale desc', lang: 'zh' },
    );
    expect(out.title).toBe('Quick Start | Locale Title');
    expect(out.htmlAttrs.lang).toBe('en-US');
    expect(out.meta[0].content).toBe('Page desc');
  });
});
