import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getBackTopScrollTarget,
  getPageScrollTop,
  isBackTopVisible,
} from '../src/theme-default/components/BackTop/utils';

describe('backTop', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses window scroll position for visibility checks', () => {
    vi.stubGlobal('window', { scrollY: 240 });
    vi.stubGlobal('document', {
      body: { scrollTop: 0 },
      documentElement: { scrollTop: 0 },
    });

    expect(getPageScrollTop()).toBe(240);
    expect(isBackTopVisible(getPageScrollTop(), 200)).toBe(true);
  });

  it('uses the browser scrolling element as the scroll target', () => {
    const scrollingElement = { scrollTop: 120 };
    vi.stubGlobal('document', {
      body: { scrollTop: 0 },
      documentElement: { scrollTop: 0 },
      scrollingElement,
    });

    expect(getBackTopScrollTarget()).toBe(scrollingElement);
  });
});
