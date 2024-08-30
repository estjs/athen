import { BackTop } from '../components/Backtop';
import NavHeader from '../components/Nav';
import { DocContent } from './DocContent';
export default function Layout() {
  return (
    <>
      <NavHeader />
      <section class="pt-[--at-nav-height]">
        <DocContent />
        <BackTop></BackTop>
      </section>
    </>
  );
}
