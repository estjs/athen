import { computed } from 'essor';
import { usePageData } from '@/runtime';
import { usePathname } from './usePathname';
import { resolveLocaleSiteData } from './localeSiteData';
import { getLocalePath } from './localePath';

export { getLocalePath };

export function useLocaleSiteData() {
  const pageData = usePageData();
  const pathname = usePathname();

  return computed(() => {
    const siteData = pageData?.siteData;
    if (!siteData) {
      return { label: '' };
    }
    return resolveLocaleSiteData(siteData, pathname.value, siteData.base || '/');
  });
}
