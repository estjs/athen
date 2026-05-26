import { effect } from 'essor';
import { createHead } from 'unhead/client';
import { useHead } from 'unhead';
import { composeHeadInput, type HeadInput } from '@shared/title';
import type { PageData } from '@shared/types';

/**
 * Drive document head (`<title>`, `<html lang>`, `<meta name="description">`)
 * from the reactive `pageData`. One Unhead entry, patched on every change via
 * Essor's `effect` — replaces the imperative `applyPageMeta` + `router.beforeEach`
 * pair. Same code path covers CSR initial mount and SPA navigation, and adopts
 * SSG-emitted head tags via Unhead's DOM renderer (no double-write on hydrate).
 */
export function syncPageHead(pageData: PageData) {
  const head = createHead();
  const entry = useHead(head, {});

  effect(() => {
    entry.patch(resolveHeadInput(pageData));
  });

  return head;
}

export function resolveHeadInput(pageData: PageData): HeadInput {
  const siteData = pageData.siteData;
  const fm = (pageData.frontmatter ?? {}) as Record<string, unknown>;

  return composeHeadInput({
    pageTitle: typeof fm.title === 'string' ? fm.title : pageData.title,
    pageDescription: typeof fm.description === 'string' ? fm.description : pageData.description,
    pageLang: (pageData as { lang?: string }).lang,
    siteTitle: siteData?.title,
    siteDescription: siteData?.description,
    siteLang: siteData?.lang,
  });
}

