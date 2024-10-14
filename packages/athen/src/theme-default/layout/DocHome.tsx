import { usePageData } from '@/runtime';
import { HomeHero } from '../components/HomeHero';
import { HomeFeature } from '../components/HomeFeature';
import { HomeFooter } from '../components/HomeFooter';
export function DocHomeLayout() {
  const pageData = usePageData();

  return (
    <>
      <HomeHero hero={pageData.frontmatter?.hero || {}} />
      <HomeFeature features={pageData.frontmatter?.features || {}} />
      {pageData.siteData?.themeConfig?.footer && (
        <HomeFooter footer={pageData.siteData?.themeConfig?.footer} />
      )}
    </>
  );
}
