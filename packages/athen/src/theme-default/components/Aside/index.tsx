import { computed, onDestroy, onMount, signal } from 'essor';
import { scrollToTarget, useActiveToc } from '@theme-default/hooks';
import { usePageData } from '@/runtime';
import type { Header } from '@shared/types/index';
import './style.scss';
export function Aside(props: { pagePath: string; outlineTitle: string }) {
  const pageData = usePageData()!;

  const headers = computed(() => {
    return pageData.toc || [];
  });

  const hasOutline = computed(() => headers.value.length > 0);
  const markerRef = signal<HTMLDivElement | null>(null);

  let scrollHandler;
  onMount(() => {
    setTimeout(() => {
      scrollHandler = useActiveToc();
      window.addEventListener('scroll', scrollHandler);
    }, 100);
  });

  onDestroy(() => {
    window.removeEventListener('scroll', scrollHandler);
  });

  const renderHeader = (header: Header) => {
    return (
      <li key={header.id}>
        <a
          href={`#${header.id}`}
          class="toc-item avoid-text-overflow block text-14px text-text-2 leading-7 transition-color duration-300 hover:text-text-1"
          style={{
            'padding-left': `${(header.depth - 2) * 12}px`,
          }}
          onClick={e => {
            e.preventDefault();
            // eslint-disable-next-line unicorn/prefer-query-selector
            const target = document.getElementById(header.id);
            target && scrollToTarget(target, false);
          }}
        >
          {header.text}
        </a>
      </li>
    );
  };

  return (
    <div class="aside flex flex-1 flex-col">
      <div class={hasOutline.value ? 'lg:block' : 'none'}>
        <div class="divider-left relative pl-4 text-[13px] font-medium" id="aside-container">
          <div
            class="absolute top-[33px] w-2px bg-brand opacity-0"
            ref={markerRef}
            style={{
              height: '18px',
              left: '-2px',
              borderRadius: '2px',
              backgroundColor: 'var(--at-c-accent)',
              transition:
                'top 0.35s cubic-bezier(0.25, 1, 0.5, 1), height 0.3s ease, opacity 0.3s ease',
            }}
            id="aside-marker"
          ></div>
          <div class="mt-2 block text-[16px] font-semibold leading-7">{props.outlineTitle}</div>
          <nav>
            <ul class="relative">{headers.value.map(renderHeader)}</ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
