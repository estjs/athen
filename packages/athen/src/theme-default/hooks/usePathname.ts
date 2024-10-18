import { useRoute } from 'essor-router';
import { useSignal, useWatch } from 'essor';
const pathname = useSignal<string>();

let route;
function useRoutePath() {
  route ||= useRoute();

  useWatch(
    () => route.path,
    () => {
      pathname.value = route.path;
    },
    {
      immediate: true,
    },
  );
}

const init = false;
export function usePathname() {
  if (init) {
    return pathname;
  }
  useRoutePath();
  return pathname;
}
