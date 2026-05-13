import { computed } from 'essor';
import { useRouter } from 'essor-router';
import { usePageData } from '@/runtime';

export function usePathname() {
  const pageData = usePageData();
  const router = useRouter();

  return computed(() => {
    return (
      pageData.routePath ||
      router.currentRoute.value.path ||
      (typeof window !== 'undefined' ? window.location.pathname : '/')
    );
  });
}
