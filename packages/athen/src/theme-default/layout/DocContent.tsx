import { RouterView } from 'essor-router';
import { computed } from 'essor';
import { usePageData } from '@/runtime';
import { SideBar } from '../components/SideBar';
import DocFooter from '../components/DocFooter';
import { Aside } from '../components/Aside';
import { useLocaleSiteData } from '../hooks';
import { DocHomeLayout } from './DocHome';
import { NotFound } from './NotFound';
import './style.css';

export function DocContent() {
  const pageData = usePageData()!;
  const localeData = useLocaleSiteData();

  const hasAside = computed(() => {
    return (pageData.toc || []).length > 0 && (pageData.frontmatter?.outline ?? true);
  });
  const outlineTitle = computed(() => localeData.value.outlineTitle ?? 'On this page');
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
              <Aside outlineTitle={outlineTitle.value} pagePath={pageData.pagePath!} />
            )}
          </div>
        );
      default:
        return <NotFound />;
    }
  });

  return <div class="doc-content h-full w-full">{content.value}</div>;
}
