import { useRoute } from 'essor-router';
import { signal, watch } from 'essor';
const pathname = signal<string>();

let route;
function useRoutePath() {
  route ||= useRoute();

  watch(
    () => route?.path,
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
