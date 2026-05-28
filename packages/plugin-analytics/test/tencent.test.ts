import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Tencent MTA provider', () => {
  it('emits the MTA snippet referencing sid only when cid is omitted', () => {
    const plugin = analyticsPlugin({ tencent: { sid: 'tencent-sid' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0].tag).toBe('script');
    expect(tags[0].injectTo).toBe('head');
    expect(tags[0].children).toContain('tencent-sid');
    expect(tags[0].children).toContain('pingjs.qq.com');
    expect(tags[0].children).not.toContain('cid');
  });

  it('includes cid when provided alongside sid', () => {
    const plugin = analyticsPlugin({ tencent: { sid: 'tencent-sid', cid: 'tencent-cid' } });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags[0].children).toContain('tencent-sid');
    expect(tags[0].children).toContain('tencent-cid');
  });
});
