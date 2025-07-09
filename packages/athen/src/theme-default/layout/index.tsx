import { BackTop } from '../components/Backtop';
import NavHeader from '../components/Nav';
import { DocContent } from './DocContent';
import { usePageData } from '@/runtime';

export default function Layout() {
  const { siteData } = usePageData();
  const slots = siteData?.themeConfig?.slots || {};
  const Banner = slots.banner as any;
  const FooterExtra = slots.footerExtra as any;

  return (
    <>
      <NavHeader />
      {Banner && <Banner />}
      <section class="pt-[--at-nav-height]">
        <DocContent />
        <BackTop></BackTop>
      </section>
      {FooterExtra && <FooterExtra />}
    </>
  );
}
