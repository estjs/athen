import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Vercel Analytics provider', () => {
  it('emits the vercel analytics script with id', () => {
    const plugin = analyticsPlugin({ vercel: { id: 'vercel-id' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: '',
      attrs: {
        'defer': true,
        'src': 'https://vercel.analytics.com/script.js',
        'data-id': 'vercel-id',
      },
    });
  });
});
