import { useRoute } from 'essor-router';
import { useSignal, useWatch } from 'essor';

export const pathname = useSignal<string>('');
let route;
export function usePathname() {
  route ||= useRoute();
  pathname.value = route.path;
  useWatch(
    () => route.path,
    () => {
      pathname.value = route.path;
    },
  );
}
