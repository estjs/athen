import { usePageData } from '@/runtime';
import { BackTop } from '../components/BackTop';
import NavHeader from '../components/Nav';
import { DocContent } from './DocContent';

export default function Layout() {
  const { siteData } = usePageData();
  const slots = siteData?.slots || {};
  const Banner = slots.banner as (() => unknown) | undefined;
  const FooterExtra = slots.footerExtra as (() => unknown) | undefined;

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
