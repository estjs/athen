import { renderToString } from 'essor';
import { routes } from 'athen:routes';
import { RouterView, createMemoryHistory } from 'essor-router';
import Layout from '@/theme-default';
import { createRouter } from './router';
const router = createRouter(createMemoryHistory(import.meta.env.BASE_URL));

export function render(props) {
  return (
    <RouterView>
      {renderToString(props.default, {
        components: {
          wrapper: Layout,
        },
      })}
    </RouterView>
  );
}

const route = routes[0].children;
export { route as routes };
