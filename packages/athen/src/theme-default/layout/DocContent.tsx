import { RouterView } from 'essor-router';
import { usePageData } from '@/runtime';
import { useHeaders } from '../hooks';
import { SideBar } from '../components/SideBar';
import DocFooter from '../components/DocFooter';
import { Aside } from '../components/Aside';
import { DocHomeLayout } from './DocHome';
import './style.scss';
export function DocContent() {
  const pageData = usePageData();

  const { siteData, pageType, toc = [], pagePath, frontmatter } = pageData || {};

  const [headers] = useHeaders(toc, pagePath);
  const themeConfig = siteData?.themeConfig || {};
  const hasAside =
    headers.value.length > 0 && (frontmatter?.outline ?? themeConfig?.outline ?? true);

  let content;
  switch (pageType) {
    case 'home':
      content = <DocHomeLayout />;
      break;
    case 'doc':
      content = (
        <>
          <SideBar />
          <div class="content">
            <div class="at-doc">
              <RouterView />
            </div>
            <DocFooter />
          </div>
          {hasAside ? (
            <Aside headers={headers.value} outlineTitle={'目录'} pagePath={pagePath} />
          ) : null}
        </>
      );
      break;
    default:
      content = <div>404 页面</div>;
  }

  return <div class="h-full w-full">{content}</div>;
}
