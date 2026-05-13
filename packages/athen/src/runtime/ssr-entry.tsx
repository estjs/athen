import { RouterView, createWebHistory } from 'essor-router';
import { createApp, provide, reactive } from 'essor';
import { setup } from '../theme-default';
import { createRouter, initPageData } from './router';
import { PageDataKey } from '.';

function getCurrentRoutePath() {
  const { pathname } = window.location;

  if (pathname.endsWith('/index.html')) {
    return pathname.slice(0, -'index.html'.length);
  }

  if (pathname.endsWith('.html')) {
    return pathname.slice(0, -'.html'.length);
  }

  return pathname;
}

async function SSREntry() {
  const router = createRouter(createWebHistory(import.meta.env.BASE_URL));

  const currentRoutePath = getCurrentRoutePath();
  const pageDataInitValue = await initPageData(currentRoutePath);
  const pageData = reactive(pageDataInitValue);
  router.beforeEach(async (to, from, next) => {
    Object.assign(pageData, await initPageData(to.path));
    next();
  });
  await router.replace(currentRoutePath);
  await router.isReady();

  function SSRRender() {
    provide(PageDataKey, pageData);
    return <RouterView router={router}></RouterView>;
  }
  createApp(SSRRender, '#app');
  return { router };
}
// eslint-disable-next-line unicorn/prefer-top-level-await
SSREntry().then(() => {
  setup();
});
