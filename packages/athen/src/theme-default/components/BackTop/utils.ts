export function getBackTopScrollTarget(): Element {
  return document.scrollingElement || document.documentElement || document.body;
}

export function getPageScrollTop(): number {
  if (typeof window !== 'undefined' && typeof window.scrollY === 'number') {
    return window.scrollY;
  }

  return getBackTopScrollTarget().scrollTop || document.body?.scrollTop || 0;
}

export function isBackTopVisible(scrollTop: number, visibleHeight: number): boolean {
  return scrollTop >= visibleHeight;
}
