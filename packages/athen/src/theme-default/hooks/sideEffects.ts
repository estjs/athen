import { throttle } from 'lodash-es';
import { inBrowser } from '../../shared/utils';
import { setupCopyCodeButton } from './copyCode';

const DEFAULT_NAV_HEIGHT = 56;

export function scrollToTarget(target: HTMLElement, isSmooth: boolean) {
  const targetPadding = Number.parseInt(window.getComputedStyle(target).paddingTop, 10);

  const targetTop =
    window.scrollY + target.getBoundingClientRect().top - DEFAULT_NAV_HEIGHT + targetPadding;
  // Only scroll smoothly in page header anchor
  window.scrollTo({
    left: 0,
    top: targetTop,
    ...(isSmooth ? { behavior: 'smooth' } : {}),
  });
}

// Control the scroll behavior of the browser when user clicks on a link
function bindingWindowScroll() {
  // Initial scroll position
  function scrollTo(el: HTMLElement, hash: string, isSmooth = false) {
    let target: HTMLElement | null = null;
    try {
      target = el.classList.contains('header-anchor')
        ? el
        : document.querySelector(`#${decodeURIComponent(hash.slice(1))}`);
    } catch (error) {
      console.warn(error);
    }
    if (target) {
      scrollToTarget(target, isSmooth);
    }
  }

  window.addEventListener(
    'click',
    e => {
      // Only handle a tag click
      const link = (e.target as Element).closest('a');
      if (link) {
        const { origin, hash, target, pathname, search } = link;
        const currentUrl = window.location;
        // only intercept inbound links
        if (
          hash &&
          target !== '_blank' &&
          origin === currentUrl.origin &&
          pathname === currentUrl.pathname &&
          search === currentUrl.search &&
          hash &&
          hash !== currentUrl.hash &&
          link.classList.contains('header-anchor')
        ) {
          e.preventDefault();
          history.pushState(null, '', hash);
          scrollTo(link, hash, true);
          window.dispatchEvent(new Event('hashchange'));
        }
      }
    },
    { capture: true },
  );
  window.addEventListener('hashchange', e => {
    e.preventDefault();
  });
}

// Binding the scroll event to the aside element
export function bindingAsideScroll() {
  function isBottom() {
    return (
      document.documentElement.scrollTop + window.innerHeight >=
      document.documentElement.scrollHeight
    );
  }
  const NAV_HEIGHT = 56;
  const marker: HTMLElement | null = document.querySelector('#aside-marker');
  const aside = document.querySelector('#aside-container');
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.athen-doc .header-anchor'),
  ).filter(item => item.parentElement?.tagName !== 'H1');

  if (!aside || links.length === 0) {
    return;
  }

  let prevActiveLink: null | HTMLAnchorElement = null;
  const headers = Array.from(aside?.getElementsByTagName('a') || []).map(item =>
    decodeURIComponent(item.hash),
  );
  if (marker && headers.length === 0) {
    marker.style.opacity = '0';
    return;
  }
  // Util function to set dom ref after determining the active link
  const activate = (links: HTMLAnchorElement[], index: number) => {
    if (prevActiveLink) {
      prevActiveLink.classList.remove('aside-active');
    }
    if (links[index]) {
      links[index].classList.add('aside-active');
      const id = links[index].getAttribute('href');
      const tocIndex = headers.indexOf(id || '');
      const currentLink = aside?.querySelector(`a[href="#${id?.slice(1)}"]`);
      if (currentLink) {
        prevActiveLink = currentLink as HTMLAnchorElement;
        // Activate the a link element in aside
        prevActiveLink.classList.add('aside-active');
        // Activate the marker element
        marker!.style.top = `${33 + tocIndex * 28}px`;
        marker!.style.opacity = '1';
      }
    }
  };
  const setActiveLink = () => {
    if (isBottom()) {
      activate(links, links.length - 1);
    } else {
      // Compute current index
      for (let i = 0; i < links.length; i++) {
        const currentAnchor = links[i];
        const nextAnchor = links[i + 1];
        const scrollTop = window.scrollY;
        const currentAnchorTop = currentAnchor.parentElement!.offsetTop - NAV_HEIGHT;
        if ((i === 0 && scrollTop < currentAnchorTop) || scrollTop === 0) {
          activate(links, 0);
          break;
        }

        if (!nextAnchor) {
          activate(links, i);
          break;
        }

        const nextAnchorTop = nextAnchor.parentElement!.offsetTop - NAV_HEIGHT;

        if (scrollTop >= currentAnchorTop && scrollTop < nextAnchorTop) {
          activate(links, i);
          break;
        }
      }
    }
  };
  const throttledSetLink = throttle(setActiveLink, 200);

  window.addEventListener('scroll', throttledSetLink);

  return () => {
    window.removeEventListener('scroll', throttledSetLink);
  };
}

export function setup() {
  if (!inBrowser()) {
    return;
  }
  bindingWindowScroll();
  setupCopyCodeButton();
}
