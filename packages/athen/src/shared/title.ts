import type { LocaleTemplateContext } from '@/shared/utils';
import type { SiteData } from '@/shared/types';

/**
 * Format a page's document title by combining the per-page title with the site
 */
export function formatPageTitle(pageTitle: string | undefined | null, siteTitle: string): string {
  const page = (pageTitle ?? '').trim();
  const site = (siteTitle ?? '').trim();

  if (!page) return site;
  if (!site || page === site) return page;

  return `${page} | ${site}`;
}

/**
 * Convert a file or folder basename (e.g. `getting-started`, `api_reference`)
 * into a human-friendly Title-Cased label.
 */
export function humanize(name: string): string {
  return name.replaceAll(/[-_]+/g, ' ').replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Head input — fallback chain → Unhead shape
// ---------------------------------------------------------------------------

export interface PageHeadSource {
  title?: string;
  description?: string;
  lang?: string;
}

export interface HeadInput {
  title: string;
  htmlAttrs: { lang: string };
  meta: Array<{ name: string; content: string }>;
}

function pickString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return undefined;
}

/**
 * Build the Unhead `useHead` input from a page → locale → site fallback chain.
 * Shared between the runtime (`runtime/head.ts`) and Node-side renderers
 * (`node/build.ts`, `node/plugins/core.ts`). Empty strings and undefined skip
 * to the next fallback; the final lang fallback is `'en'`.
 */
export function composeHeadInput(opts: {
  pageTitle?: string;
  pageDescription?: string;
  pageLang?: string;
  localeTitle?: string;
  localeDescription?: string;
  localeLang?: string;
  siteTitle?: string;
  siteDescription?: string;
  siteLang?: string;
}): HeadInput {
  const siteTitle = pickString(opts.localeTitle, opts.siteTitle) || 'Athen';
  const title = formatPageTitle(pickString(opts.pageTitle), siteTitle);
  const lang = pickString(opts.pageLang, opts.localeLang, opts.siteLang) || 'en';
  const description = pickString(opts.pageDescription, opts.localeDescription, opts.siteDescription);
  return {
    title,
    htmlAttrs: { lang },
    meta: description ? [{ name: 'description', content: description }] : [],
  };
}

/**
 * Server-side convenience: collapse `(siteData, route|matched, locale)` into the
 * unhead input. Used by `node/build.ts` for SSG and `node/plugins/core.ts` for
 * the dev middleware so both paths compute identical head metadata.
 */
export function resolveServerPageHead(
  siteData: SiteData,
  page: PageHeadSource | undefined,
  locale: LocaleTemplateContext | undefined,
): HeadInput {
  return composeHeadInput({
    pageTitle: page?.title,
    pageDescription: page?.description,
    pageLang: page?.lang,
    localeTitle: locale?.title,
    localeDescription: locale?.description,
    localeLang: locale?.lang,
    siteTitle: siteData.title,
    siteDescription: siteData.description,
    siteLang: siteData.lang,
  });
}
