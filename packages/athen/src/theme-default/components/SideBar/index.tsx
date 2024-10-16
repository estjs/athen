import { pathname, useLocaleSiteData } from '@/theme-default/hooks';
import PageLink from '../Link';
import './style.scss';
import { useSidebarData } from '../../hooks/useSidebarData';

export function SideBar() {
  const localeData = useLocaleSiteData();
  const sidebarData = useSidebarData(pathname.value, localeData.value.sidebar!);

  return (
    <aside class="sidebar">
      <nav>
        {sidebarData.value.items.map(item => (
          <section class="mt-4 border-t b-border-default first:mt-4">
            <div class="flex items-center justify-between">
              <h2 class="mb-2 mt-3 text-16px font-bold">
                <span>{item.text}</span>
              </h2>
            </div>
            <div class="mb-1">
              {item.items.map(i => (
                <div class="ml-5">
                  <div
                    class={`p-1 font-medium ${i.link === pathname.value ? 'text-brand' : 'text-gray-500'}`}
                  >
                    <PageLink href={i.link}>{i.text}</PageLink>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
