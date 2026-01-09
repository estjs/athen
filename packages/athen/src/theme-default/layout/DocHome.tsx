import { usePageData } from '@/runtime';
import { HomeHero } from '../components/HomeHero';
import { HomeFeature } from '../components/HomeFeature';
import { HomeCTA } from '../components/HomeCTA';
import { HomeSponsors } from '../components/HomeSponsors';
import { HomeFooter } from '../components/HomeFooter';
export function DocHomeLayout() {
  const pageData = usePageData();

  return (
    <div>
      <HomeHero hero={pageData.frontmatter?.hero || {}} />
      <HomeFeature features={pageData.frontmatter?.features || []} />
      <HomeCTA cta={pageData.frontmatter?.cta} />
      <HomeSponsors sponsors={pageData.frontmatter?.sponsors} />
      {pageData.siteData?.themeConfig?.footer && (
        <HomeFooter footer={pageData.siteData?.themeConfig?.footer} />
      )}
    </div>
  );
}
