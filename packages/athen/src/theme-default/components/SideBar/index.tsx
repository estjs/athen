import { useRoute } from 'essor-router';
import { useComputed } from 'essor';
import { useLocaleSiteData } from '@/theme-default/hooks';
import PageLink from '../Link';
import './style.scss';
import { useSidebarData } from '../../hooks/useSidebarData';

export function SideBar() {
  const route = useRoute();
  const pathname = location.pathname || route.path;
  const localeData = useLocaleSiteData();

  const items = useComputed(() => {
    return useSidebarData(route.path, localeData.sidebar!).items;
  });

  return (
    <aside class="sidebar">
      <nav>
        {items.value.map(item => (
          <section class="mt-4 border-t b-border-default first:mt-4">
            <div class="flex items-center justify-between">
              <h2 class="mb-2 mt-3 text-16px font-bold">
                <span>{item.text}</span>
              </h2>
            </div>
            <div class="mb-1">
              {item.items.map(i => (
                <div key={i.link} class="ml-5">
                  <div
                    class={`p-1 font-medium ${i.link === pathname ? 'text-brand' : 'text-gray-500'}`}
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
