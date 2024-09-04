import { usePageData } from '@/runtime';
import { HomeHero } from '../components/HomeHero';
import { HomeFeature } from '../components/HomeFeature';
import { HomeFooter } from '../components/HomeFooter';
export function DocHomeLayout() {
  const pageData = usePageData();

  return (
    <>
      <HomeHero hero={pageData.value.frontmatter?.hero || {}} />
      <HomeFeature features={pageData.value.frontmatter?.features || {}} />
      {pageData.value.siteData?.themeConfig?.footer && (
        <HomeFooter footer={pageData.value.siteData?.themeConfig?.footer} />
      )}
    </>
  );
}
