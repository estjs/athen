import { RouterView } from 'essor-router';
import { usePageData } from '@runtime';
import '@theme-default/styles/base.css';
import '@theme-default/styles/vars.css';
import '@theme-default/styles/doc.css';
import './style.css';

interface NavItem {
  text: string;
  link: string;
}

export default function Layout() {
  const pageData = usePageData();
  const nav = ((pageData.siteData.themeConfig as { nav?: NavItem[] }).nav || []) as NavItem[];

  return (
    <div class="example-theme-shell">
      <header class="example-theme-header">
        <a class="example-theme-brand" href="/">
          Custom Theme Example
        </a>
        <nav class="example-theme-nav">
          {nav.map((item) => (
            <a href={item.link} key={item.link}>
              {item.text}
            </a>
          ))}
        </nav>
      </header>
      <main class="example-theme-main">
        <p class="example-theme-label">Local theme layout</p>
        <div class="at-doc">
          <RouterView />
        </div>
      </main>
      <footer class="example-theme-footer">Rendered by a local Athen theme.</footer>
    </div>
  );
}
