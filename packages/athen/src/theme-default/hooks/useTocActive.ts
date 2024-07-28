import { debounce } from 'lodash-es';
function hightLight(id) {
  document.querySelectorAll('.toc-item').forEach(item => {
    item.classList.remove('highlight');
  });

  if (id.startsWith('#')) {
    id = id.slice(1);
  }
  document.querySelector(`.toc-item[href="#${id}"]`)?.classList.add('highlight');
}

export function useActiveToc() {
  const links = Array.from(document.querySelectorAll(`.toc-item`)) as HTMLLinkElement[];
  const headers: Element[] = [];
  const topRange = 500;

  for (const link of links) {
    link.addEventListener('click', () => {
      hightLight(link.getAttribute('href'));
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
        hightLight(title.getAttribute('href'));
        break;
      } else if (
        rect.top < 0 &&
        rect[i + 1] &&
        rect[i + 1].top >= document.documentElement.clientHeight
      ) {
        hightLight(title.getAttribute('href'));
        break;
      }
    }
  }, 100);

  // 监听滚动事件
  window.addEventListener('scroll', scrollHandler);
}
