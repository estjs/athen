import { RouterView, createWebHistory } from 'essor-router';
import { createApp, provide, reactive } from 'essor';
import * as theme from '@theme';
import { createRouter, initPageData } from './router';
import { syncPageHead } from './head';
import { PageDataKey } from '.';

type Mode = 'client' | 'ssr';

function currentRoutePath() {
  const { pathname } = window.location;
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length);
  if (pathname.endsWith('.html')) return pathname.slice(0, -'.html'.length);
  return pathname;
}

/**
 * Shared bootstrap for the two browser entries. The CSR entry (`clientEntry`)
 * clears the app shell before hydrating; the SSR entry hydrates over
 * server-rendered markup. In both cases, `syncPageHead` owns the document head
 * via Unhead — first run adopts any SSR-emitted tags, subsequent reactive
 * updates patch in place on SPA navigation.
 */
export async function createEntry(mode: Mode) {
  if (mode === 'client') document.querySelector('#app')!.innerHTML = '';

  const router = createRouter(createWebHistory(import.meta.env.BASE_URL));
  const path = currentRoutePath();
  const pageData = reactive(await initPageData(path));

  syncPageHead(pageData);
  router.beforeEach(async (to, _from, next) => {
    Object.assign(pageData, await initPageData(to.path));
    next();
  });
  // Reset scroll to the top on real page navigations. Skip same-page changes and
  // hash links so in-page anchor scrolling (handled in theme `sideEffects`) wins.
  router.afterEach((to, from) => {
    if (typeof window === 'undefined' || to.hash || to.path === from.path) return;
    window.scrollTo({ top: 0, left: 0 });
  });
  await router.replace(path);
  await router.isReady();

  createApp(() => {
    provide(PageDataKey, pageData);
    return <RouterView router={router}></RouterView>;
  }, '#app');

  theme.setup?.();
  return { router };
}
