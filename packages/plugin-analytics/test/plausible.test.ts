import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Plausible provider', () => {
  it('emits a deferred plausible.js with default apiHost', () => {
    const plugin = analyticsPlugin({ plausible: { domain: 'example.com' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: '',
      attrs: {
        'defer': true,
        'data-domain': 'example.com',
        'src': 'https://plausible.io/js/plausible.js',
      },
    });
  });

  it('uses the provided apiHost when set', () => {
    const plugin = analyticsPlugin({
      plausible: { domain: 'example.com', apiHost: 'https://custom.plausible.io' },
    });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags[0].attrs.src).toBe('https://custom.plausible.io/js/plausible.js');
  });
});
