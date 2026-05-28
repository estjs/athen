import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Ali CNZZ provider', () => {
  it('emits the CNZZ snippet referencing the site id', () => {
    const plugin = analyticsPlugin({ ali: { id: 'cnzz-site-id' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0].tag).toBe('script');
    expect(tags[0].injectTo).toBe('head');
    expect(tags[0].children).toContain('cnzz-site-id');
    expect(tags[0].children).toContain('cnzz_stat_icon');
  });
});
