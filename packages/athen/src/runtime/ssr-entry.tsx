import { RouterView, createWebHistory } from 'essor-router';
import { hydrate, provide, reactive } from 'essor';
import { setup } from '../theme-default';
import { createRouter, initPageData } from './router';
import { PageDataKey } from '.';

async function SSREntry() {
  const router = createRouter(createWebHistory(import.meta.env.BASE_URL));

  const pageDataInitValue = await initPageData(import.meta.env.BASE_URL);
  const pageData = reactive(pageDataInitValue);
  router.beforeEach(async (to, from, next) => {
    Object.assign(pageData, await initPageData(to.path));
    next();
  });

  function SSRRender() {
    provide(PageDataKey, pageData);
    return <RouterView router={router}></RouterView>;
  }
  hydrate(SSRRender, '#app');
  return { router };
}
// eslint-disable-next-line unicorn/prefer-top-level-await
SSREntry().then(() => {
  setup();
});
