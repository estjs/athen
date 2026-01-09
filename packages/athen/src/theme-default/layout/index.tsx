import { usePageData } from '@/runtime';
import { BackTop } from '../components/BackTop';
import NavHeader from '../components/Nav';
import { DocContent } from './DocContent';

export default function Layout() {
  const { siteData } = usePageData();
  const slots = siteData?.themeConfig?.slots || {};
  const Banner = slots.banner;
  const FooterExtra = slots.footerExtra;

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
