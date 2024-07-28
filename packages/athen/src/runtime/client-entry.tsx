import { createMemoryHistory, createWebHistory } from 'essor-router';
import { useProvide } from 'essor';
import Layout from '../theme-default';
import { createRouter, initPageData } from './router';
import type { Router } from '../node/plugins/router';

async function ClientEntry(client = false, route?: Router) {
  const router = createRouter(
    !client
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
  );

  if (!client) {
    const pageData = await initPageData(route!.path);
    useProvide('pageData', pageData);
  } else {
    const pageData = await initPageData(location.pathname);

    function ClientRender() {
      useProvide('pageData', pageData);
      return <Layout />;
    }
    (<ClientRender></ClientRender>).mount(document.querySelector('#app')!);
  }
  return { router };
}
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  if (!import.meta.env.SSR) await ClientEntry(true);
})();
