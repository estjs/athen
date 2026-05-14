import { renderToStringAsync } from 'essor/server';
import { routes } from 'athen:routes';
import { provide } from 'essor';
import { RouterView, createMemoryHistory } from 'essor-router';
import 'uno.css';
import { createRouter, initPageData } from './router';
import { PageDataKey } from '.';

export async function render(routePath: string) {
  const router = createRouter(createMemoryHistory(import.meta.env.BASE_URL));
  const pageData = await initPageData(routePath);
  await router.push(routePath);
  await router.isReady();

  function SSGRender() {
    provide(PageDataKey, pageData);
    return <RouterView router={router}></RouterView>;
  }

  return renderToStringAsync(SSGRender);
}
const route = routes[0].children;
export { route as routes };
