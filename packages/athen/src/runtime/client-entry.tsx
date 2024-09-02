import { RouterView, createWebHistory } from 'essor-router';
import { useProvide, useReactive } from 'essor';
import { setup } from '../theme-default';
import { createRouter, initPageData } from './router';
import { PageDataKey } from '.';

async function ClientEntry() {
  document.querySelector('#app')!.innerHTML = '';

  const router = createRouter(createWebHistory(import.meta.env.BASE_URL));

  const pageDataInitValue = await initPageData(import.meta.env.BASE_URL);
  const pageData = useReactive(pageDataInitValue);
  router.beforeEach(async (to, from, next) => {
    Object.assign(pageData, await initPageData(to.path));
    next();
  });

  function ClientRender() {
    useProvide(PageDataKey, pageData);
    return <RouterView></RouterView>;
  }
  (<ClientRender></ClientRender>).mount(document.querySelector('#app')!);
  return { router };
}
// eslint-disable-next-line unicorn/prefer-top-level-await
ClientEntry().then(() => {
  setup();
});
