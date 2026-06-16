import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Vercel Analytics provider', () => {
  it('emits the window.va stub plus the same-origin deferred script', () => {
    const plugin = analyticsPlugin({ vercel: { id: 'vercel-id' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(2);
    // Bootstrap stub that queues events until the script loads.
    expect(tags[0]).toMatchObject({ tag: 'script', injectTo: 'head' });
    expect(tags[0].children).toContain('window.va');
    // The tracking script is served same-origin from /_vercel/insights.
    expect(tags[1]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: '',
      attrs: {
        'defer': true,
        'src': '/_vercel/insights/script.js',
        'data-id': 'vercel-id',
      },
    });
  });
});
