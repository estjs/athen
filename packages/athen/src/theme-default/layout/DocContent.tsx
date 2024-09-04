import { useRoute } from 'essor-router';
import { useComputed } from 'essor';
import { usePageData } from '@/runtime';
import { useHeaders } from '../hooks';
import { SideBar } from '../components/SideBar';
import DocFooter from '../components/DocFooter';
import { Aside } from '../components/Aside';
import { DocHomeLayout } from './DocHome';
import { NotFound } from './NotFound';
import './style.scss';

export function DocContent() {
  const pageData = usePageData();
  const route = useRoute();

  const Component = useComputed(() => {
    const matched = route.matched?.at(-1);
    return matched?.components?.default || NotFound;
  });

  const { siteData, toc = [], pagePath, frontmatter } = pageData.value;
  const [headers] = useHeaders(toc, pagePath!);
  const themeConfig = siteData?.themeConfig || {};
  const hasAside =
    headers.value.length > 0 && (frontmatter?.outline ?? themeConfig.outline ?? true);

  return (
    <div class="h-full w-full">
      {pageData.value.pageType === 'home' ? (
        <DocHomeLayout></DocHomeLayout>
      ) : pageData.value.pageType === 'doc' ? (
        <>
          <SideBar />
          <div class="content">
            <div class="at-doc">
              <Component.value />
            </div>
            <DocFooter />
          </div>
          {hasAside && (
            <Aside
              headers={headers.value}
              outlineTitle={themeConfig.outlineTitle || '目录'}
              pagePath={pagePath!}
            />
          )}
        </>
      ) : (
        <NotFound></NotFound>
      )}
    </div>
  );
}
