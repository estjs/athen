import { closeSidebar, sidebarOpen, useLocaleSiteData, usePathname } from '@/theme-default/hooks';
import { usePageData } from '@/runtime';
import PageLink from '../Link';
import './style.css';
import { useSidebarData } from '../../hooks/useSidebarData';

export function SideBar() {
  const localeData = useLocaleSiteData();

  const pathname = usePathname();
  const sidebarData = useSidebarData(pathname, localeData);
  const { siteData } = usePageData();
  const slots = siteData?.slots || {};
  const SidebarExtra = slots.sidebarExtra as any;
  return (
    <>
      <div class={`sidebar-backdrop ${sidebarOpen.value ? 'open' : ''}`} onClick={closeSidebar} />
      <aside class={`sidebar ${sidebarOpen.value ? 'open' : ''}`}>
        <nav>
          {sidebarData.value.items.map((item) => (
            <section class="mt-4 border-t b-border-default first:mt-4">
              <div class="flex items-center justify-between">
                <h2 class="mb-2 mt-3 text-16px font-bold">
                  <span>{item.text}</span>
                </h2>
              </div>
              <div class="mb-1">
                {item.items.map((i) => (
                  <div class="ml-5">
                    <div
                      class={`p-1 font-medium ${
                        'link' in i && i.link === pathname.value ? 'text-brand' : 'text-gray-500'
                      }`}
                      onClick={closeSidebar}>
                      {'link' in i && i.link ? <PageLink href={i.link}>{i.text}</PageLink> : i.text}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {SidebarExtra && <SidebarExtra />}
        </nav>
      </aside>
    </>
  );
}
