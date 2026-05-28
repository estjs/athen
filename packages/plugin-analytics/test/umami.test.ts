import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Umami provider', () => {
  it('emits a deferred umami script with id and source', () => {
    const plugin = analyticsPlugin({
      umami: { id: 'umami-website-id', src: 'https://analytics.example.com/script.js' },
    });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: '',
      attrs: {
        'defer': true,
        'data-website-id': 'umami-website-id',
        'src': 'https://analytics.example.com/script.js',
      },
    });
  });
});
