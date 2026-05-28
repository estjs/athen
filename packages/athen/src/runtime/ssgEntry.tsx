import { renderToStringAsync } from 'essor/server';
import { provide } from 'essor';
import { createMemoryHistory } from 'essor-router';
import { useHead } from 'unhead';
import { createHead } from 'unhead/server';
import 'uno.css';
import { createRouter, initPageData } from './router';
import { resolveHeadInput } from './head';
import { RouterView, preloadSsgRoute } from './ssgRouter';
import { PageDataKey, flatRoutes } from '.';

export async function render(routePath: string) {
  const router = createRouter(createMemoryHistory(import.meta.env.BASE_URL));
  const pageData = await initPageData(routePath);
  await router.push(routePath);
  await router.isReady();
  await preloadSsgRoute(router, routePath);

  const head = createHead();
  useHead(head, resolveHeadInput(pageData));

  const html = await renderToStringAsync(() => {
    provide(PageDataKey, pageData);
    return <RouterView router={router}></RouterView>;
  });

  return { html, head };
}

export const routes = flatRoutes();
