import { debounce } from 'lodash-es';
import { signal } from 'essor';

function highlight(id: string) {
  document.querySelectorAll('.toc-item').forEach((item) => {
    item.classList.remove('highlight');
  });

  if (id.startsWith('#')) {
    id = id.slice(1);
  }
  document.querySelector(`.toc-item[href="#${id}"]`)?.classList.add('highlight');
}

export interface ActiveToc {
  /** Debounced scroll handler to attach to the window `scroll` event. */
  scrollHandler: ReturnType<typeof debounce>;
  /** Remove all click listeners and cancel the pending debounce. */
  dispose: () => void;
}

export function useActiveToc(): ActiveToc {
  const activeId = signal('');

  const links = Array.from(document.querySelectorAll(`.toc-item`)) as HTMLLinkElement[];
  const headers: Element[] = [];
  const topRange = 500;
  const cleanups: Array<() => void> = [];

  for (const link of links) {
    const onClick = () => {
      activeId.value = link.getAttribute('href') || '';
      highlight(activeId.value);
    };
    link.addEventListener('click', onClick);
    cleanups.push(() => link.removeEventListener('click', onClick));

    const url = new URL(link.href);
    const hash = decodeURIComponent(url.hash);

    const item = document.querySelector(`.header-anchor[href="${hash}"]`);

    item && headers.push(item);
  }

  const scrollHandler = debounce(() => {
    const rects = headers.map((header) => header.getBoundingClientRect());

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

  const dispose = () => {
    scrollHandler.cancel();
    cleanups.forEach((fn) => fn());
  };

  return { scrollHandler, dispose };
}
