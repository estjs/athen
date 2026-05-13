import { RouterView } from 'essor-router';
import { computed } from 'essor';
import { usePageData } from '@/runtime';
import { SideBar } from '../components/SideBar';
import DocFooter from '../components/DocFooter';
import { Aside } from '../components/Aside';
import { DocHomeLayout } from './DocHome';
import { NotFound } from './NotFound';
import './style.scss';

export function DocContent() {
  const pageData = usePageData()!;

  const themeConfig = pageData.siteData?.themeConfig || {};
  const hasAside = computed(() => {
    return (
      (pageData.toc || []).length > 0 &&
      (pageData.frontmatter?.outline ?? themeConfig.outline ?? true)
    );
  });
  const content = computed(() => {
    switch (pageData.pageType) {
      case 'home':
        return <DocHomeLayout />;
      case 'doc':
        return (
          <div class={`doc-layout ${hasAside.value ? 'has-aside' : ''}`}>
            <SideBar />
            <div class="content">
              <div class="at-doc">
                <RouterView />
              </div>
              <DocFooter />
            </div>
            {hasAside.value && (
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
