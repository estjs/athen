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
    const themeConfig = pageData?.siteData?.themeConfig ?? {};
    return resolveLocaleSiteData(themeConfig, pathname.value, pageData?.siteData?.base || '/');
  });
}
