import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Google Analytics provider', () => {
  it('emits gtag loader and config scripts with the configured id', () => {
    const plugin = analyticsPlugin({ google: { id: 'G-TESTID123' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(2);

    expect(tags[0]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: '',
      attrs: {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-TESTID123',
      },
    });

    expect(tags[1].tag).toBe('script');
    expect(tags[1].injectTo).toBe('head');
    expect(tags[1].children).toContain("gtag('config', 'G-TESTID123')");
    expect(tags[1].children).toContain('dataLayer');
  });
});
