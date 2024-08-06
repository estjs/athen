import { usePageData } from '@/runtime';
import { HomeHero } from '../components/HomeHero';
import { HomeFeature } from '../components/HomeFeature';
import { HomeFooter } from '../components/HomeFooter';
export function DocHomeLayout() {
  const pageData = usePageData();

  const { frontmatter, siteData } = pageData;

  return (
    <>
      <HomeHero hero={frontmatter!.hero!} />
      <HomeFeature features={frontmatter!.features!} />
      {siteData?.themeConfig?.footer && <HomeFooter footer={siteData?.themeConfig?.footer} />}
    </>
  );
}
