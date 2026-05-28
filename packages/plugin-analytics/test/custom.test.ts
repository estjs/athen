import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Custom snippet provider', () => {
  it('injects the raw snippet verbatim into <head>', () => {
    const customCode = 'console.log("custom analytics");';
    const plugin = analyticsPlugin({ custom: { snippet: customCode } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: customCode,
    });
  });
});
