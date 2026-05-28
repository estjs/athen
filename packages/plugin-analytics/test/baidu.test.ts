import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Baidu Tongji provider', () => {
  it('emits the hm.js snippet referencing the site id', () => {
    const plugin = analyticsPlugin({ baidu: { id: 'baidu-test-id' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0].tag).toBe('script');
    expect(tags[0].injectTo).toBe('head');
    expect(tags[0].children).toContain('hm.baidu.com/hm.js?baidu-test-id');
  });
});
