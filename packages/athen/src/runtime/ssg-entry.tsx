import { renderToString } from 'essor';
import { routes } from 'athen:routes';
import { createMemoryHistory } from 'essor-router';
import { createRouter } from './router';
import { setPageData } from '.';
createRouter(createMemoryHistory(import.meta.env.BASE_URL));

export function render(props) {
  setPageData(props);
  return renderToString(props.default);
}

const route = routes[0].children;
export { route as routes };
