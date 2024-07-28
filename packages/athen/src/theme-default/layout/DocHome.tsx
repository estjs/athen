import { usePageData } from '@/runtime';
import { HomeHero } from '../components/HomeHero';
import { HomeFeature } from '../components/HomeFeature';

export function DocHomeLayout() {
  const pageData = usePageData();

  const { frontmatter } = pageData;
  return (
    <>
      <HomeHero hero={frontmatter!.hero!} />
      <HomeFeature features={frontmatter!.features!} />
    </>
  );
}
