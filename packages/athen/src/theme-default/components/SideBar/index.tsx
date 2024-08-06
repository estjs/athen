import { useSignal } from 'essor';
import { useRoute } from 'essor-router';
import PageLink from '../Link';
import './style.scss';
import { useSidebarData } from '../../hooks/useSidebarData';

export function SideBar() {
  const route = useRoute();
  const pathname = location.pathname || route.value.path;
  const { items: sidebarData } = useSidebarData(pathname);

  const pathName = useSignal(window.location.pathname);

  return (
    <aside class="sidebar">
      <nav>
        {sidebarData.map((item, index) => (
          <section  class="mt-4 border-t b-border-default first:mt-4">
            <div class="flex items-center justify-between">
              <h2 class="mb-2 mt-3 text-16px font-bold">
                {item.link ? (
                  <PageLink href={item.link} className="h2-title">
                    {item.text}
                  </PageLink>
                ) : (
                  <span>{item.text}</span>
                )}
              </h2>
            </div>
            <div class="mb-1">
              {item.items.map(i => (
                <div key={i.link} class="ml-5">
                  <div
                    class={`p-1 font-medium ${i.link === pathName.value ? 'text-brand' : 'text-gray-500'}`}
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
