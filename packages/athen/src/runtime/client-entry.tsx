import { RouterView, createWebHistory } from 'essor-router';
import { useProvide } from 'essor';
import { setup } from '../theme-default';
import { createRouter, initPageData } from './router';

async function ClientEntry() {
  document.querySelector('#app')!.innerHTML = '';

  const router = createRouter(createWebHistory(import.meta.env.BASE_URL));
  const pageData = await initPageData(location.pathname);

  function ClientRender() {
    useProvide('pageData', pageData);
    return <RouterView />;
  }
  (<ClientRender></ClientRender>).mount(document.querySelector('#app')!);
  return { router };
}
// eslint-disable-next-line unicorn/prefer-top-level-await
ClientEntry().then(() => {
  setup();
});
