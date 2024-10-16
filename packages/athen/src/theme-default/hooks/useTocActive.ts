import { debounce } from 'lodash-es';
import { onDestroy, onMount, useSignal } from 'essor';

function highlight(id: string) {
  document.querySelectorAll('.toc-item').forEach(item => {
    item.classList.remove('highlight');
  });

  if (id.startsWith('#')) {
    id = id.slice(1);
  }
  document.querySelector(`.toc-item[href="#${id}"]`)?.classList.add('highlight');
}

export function useActiveToc() {
  const activeId = useSignal('');

  onMount(() => {
    const links = Array.from(document.querySelectorAll(`.toc-item`)) as HTMLLinkElement[];
    const headers: Element[] = [];
    const topRange = 500;

    for (const link of links) {
      link.addEventListener('click', () => {
        activeId.value = link.getAttribute('href') || '';
        highlight(activeId.value);
      });

      const url = new URL(link.href);
      const hash = decodeURIComponent(url.hash);

      const item = document.querySelector(`.header-anchor[href="${hash}"]`);

      item && headers.push(item);
    }

    const scrollHandler = debounce(() => {
      const rects = headers.map(header => header.getBoundingClientRect());

      for (const [i, title] of headers.entries()) {
        const rect = rects[i];
        if (rect.top >= 0 && rect.bottom <= topRange) {
          activeId.value = title.getAttribute('href') || '';
          highlight(activeId.value);
          break;
        } else if (
          rect.top < 0 &&
          rects[i + 1] &&
          rects[i + 1].top >= document.documentElement.clientHeight
        ) {
          activeId.value = title.getAttribute('href') || '';
          highlight(activeId.value);
          break;
        }
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler);

    onDestroy(() => {
      window.removeEventListener('scroll', scrollHandler);
    });
  });

  return activeId;
}
