import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('multi-provider composition', () => {
  it('concatenates snippets for every configured provider in order', () => {
    const plugin = analyticsPlugin({
      google: { id: 'G-TEST' },
      baidu: { id: 'baidu-id' },
      plausible: { domain: 'example.com' },
    });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    // google → 2 tags, baidu → 1, plausible → 1
    expect(tags).toHaveLength(4);
    expect(tags[0].attrs.src).toContain('googletagmanager.com');
    expect(tags[1].children).toContain('G-TEST');
    expect(tags[2].children).toContain('baidu-id');
    expect(tags[3].attrs['data-domain']).toBe('example.com');
  });
});
