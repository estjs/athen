import { onMount, useComputed, useSignal } from 'essor';
import { scrollToTarget, useActiveToc, useHeaders } from '@theme-default/hooks';
import type { Header } from '@shared/types/index';
import './style.scss';
export function Aside(props: { headers: Header[]; pagePath: string; outlineTitle: string }) {
  const [headers] = useHeaders(props.headers || [], props.pagePath);
  const hasOutline = useComputed(() => headers.value.length > 0);
  const markerRef = useSignal<HTMLDivElement | null>(null);

  onMount(() => {
    setTimeout(() => {
      useActiveToc();
    }, 200);
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
            class="absolute top-[33px] h-18px w-1px bg-brand opacity-0"
            ref={markerRef}
            style={{
              left: '-1px',
              transition:
                'top 0.25s cubic-bezier(0, 1, 0.5, 1), background-color 0.5s, opacity 0.25s',
            }}
            id="aside-marker"
          ></div>
          <div class="mt-2 block text-[16px] font-semibold leading-7">{props.outlineTitle}</div>
          <nav>
            <ul class="relative">{props.headers.map(renderHeader)}</ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
