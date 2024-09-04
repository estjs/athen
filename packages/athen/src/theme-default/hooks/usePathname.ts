import { useRoute } from 'essor-router';
import { onDestroy, useSignal, useWatch } from 'essor';

function useLocation() {
  const location = useSignal(window.location.pathname);

  const handleLocationChange = () => {
    location.value = window.location.pathname;
  };

  window.addEventListener('popstate', handleLocationChange);
  window.addEventListener('hashchange', handleLocationChange);

  onDestroy(() => {
    window.removeEventListener('popstate', handleLocationChange);
    window.removeEventListener('hashchange', handleLocationChange);
  });
  return location;
}

function useRoutePath() {
  const route = useRoute();
  const pathname = useSignal(route.path);

  useWatch(
    () => route.path,
    () => {
      pathname.value = route.path;
    },
  );

  return pathname;
}

export function usePathname() {
  return import.meta.env.SSR ? useLocation() : useRoutePath();
}
