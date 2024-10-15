import { Fragment } from 'essor';
import { BackTop } from '../components/Backtop';
import NavHeader from '../components/Nav';
import { DocContent } from './DocContent';
export default function Layout() {
  return (
    <Fragment>
      <NavHeader />
      <section class="pt-[--at-nav-height]">
        <DocContent />
        <BackTop></BackTop>
      </section>
    </Fragment>
  );
}
