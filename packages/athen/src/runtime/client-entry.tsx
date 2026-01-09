import { RouterView, createWebHistory } from 'essor-router';
import { createApp, provide, reactive } from 'essor';
import { setup } from '../theme-default';
import { createRouter, initPageData } from './router';
import { PageDataKey } from '.';

async function ClientEntry() {
  document.querySelector('#app')!.innerHTML = '';

  const router = createRouter(createWebHistory(import.meta.env.BASE_URL));

  const pageDataInitValue = await initPageData(import.meta.env.BASE_URL);
  const pageData = reactive(pageDataInitValue);
  router.beforeEach(async (to, from, next) => {
    Object.assign(pageData, await initPageData(to.path));
    next();
  });

  router.afterEach(to => {
    if (window.__athenAnalytics?.pageview) {
      window.__athenAnalytics.pageview(to.path);
    }
  });

  function ClientRender() {
    provide(PageDataKey, pageData);
    return <RouterView router={router}></RouterView>;
  }
  createApp(ClientRender, '#app');
  return { router };
}
// eslint-disable-next-line unicorn/prefer-top-level-await
ClientEntry().then(() => {
  setup();
});
