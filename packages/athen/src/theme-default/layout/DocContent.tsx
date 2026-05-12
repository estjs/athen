import { RouterView } from 'essor-router';
import { computed } from 'essor';
import { usePageData } from '@/runtime';
import { useHeaders } from '../hooks';
import { SideBar } from '../components/SideBar';
import DocFooter from '../components/DocFooter';
import { Aside } from '../components/Aside';
import { DocHomeLayout } from './DocHome';
import { NotFound } from './NotFound';
import './style.scss';

export function DocContent() {
  const pageData = usePageData()!;

  const { siteData, frontmatter } = pageData;
  const headers = useHeaders(pageData.toc || []);
  const themeConfig = siteData?.themeConfig || {};
  const hasAside =
    headers.value.length > 0 && (frontmatter?.outline ?? themeConfig.outline ?? true);
  const content = computed(() => {
    console.log('reload pageData.pageType', pageData.pageType);

    switch (pageData.pageType) {
      case 'home':
        return <DocHomeLayout />;
      case 'doc':
        return (
          <div>
            <SideBar />
            <div class="content">
              <div class="at-doc">
                <RouterView />
              </div>
              <DocFooter />
            </div>
            {hasAside && (
              <Aside
                outlineTitle={themeConfig.outlineTitle || '目录'}
                pagePath={pageData.pagePath!}
              />
            )}
          </div>
        );
      default:
        return <NotFound />;
    }
  });

  return <div class="doc-content h-full w-full">{content.value}</div>;
}
