import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('analyticsPlugin', () => {
  describe('plugin creation', () => {
    it('should return undefined when no options provided', () => {
      const plugin = analyticsPlugin();
      expect(plugin).toBeUndefined();
    });

    it('should return undefined when empty options provided', () => {
      const plugin = analyticsPlugin({});
      expect(plugin).toBeUndefined();
    });

    it('should create plugin with correct name when options provided', () => {
      const plugin = analyticsPlugin({ google: { id: 'G-TEST' } });
      expect(plugin).toBeDefined();
      expect(plugin!.name).toBe('athen-plugin-analytics');
    });

    it('should have transformIndexHtml hook', () => {
      const plugin = analyticsPlugin({ google: { id: 'G-TEST' } });
      expect(plugin).toBeDefined();
      expect(typeof plugin!.transformIndexHtml).toBe('function');
    });
  });

  describe('google Analytics', () => {
    it('should generate correct gtag script tags', () => {
      const plugin = analyticsPlugin({ google: { id: 'G-TESTID123' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(2);
      // First tag: gtag.js loader
      expect(tags[0].tag).toBe('script');
      expect(tags[0].attrs.async).toBe(true);
      expect(tags[0].attrs.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TESTID123');
      expect(tags[0].injectTo).toBe('head');
      // Second tag: gtag config
      expect(tags[1].tag).toBe('script');
      expect(tags[1].children).toContain('G-TESTID123');
      expect(tags[1].children).toContain('gtag');
      expect(tags[1].children).toContain('dataLayer');
      expect(tags[1].injectTo).toBe('head');
    });
  });

  describe('baidu Tongji', () => {
    it('should generate correct hm.js script', () => {
      const plugin = analyticsPlugin({ baidu: { id: 'baidu-test-id' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].children).toContain('hm.baidu.com/hm.js?baidu-test-id');
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('tencent MTA', () => {
    it('should generate correct MTA script with sid only', () => {
      const plugin = analyticsPlugin({ tencent: { sid: 'tencent-sid' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].children).toContain('tencent-sid');
      expect(tags[0].children).toContain('pingjs.qq.com');
      expect(tags[0].injectTo).toBe('head');
    });

    it('should generate correct MTA script with sid and cid', () => {
      const plugin = analyticsPlugin({ tencent: { sid: 'tencent-sid', cid: 'tencent-cid' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].children).toContain('tencent-sid');
      expect(tags[0].children).toContain('tencent-cid');
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('plausible', () => {
    it('should generate correct script with domain', () => {
      const plugin = analyticsPlugin({ plausible: { domain: 'example.com' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].attrs.defer).toBe(true);
      expect(tags[0].attrs['data-domain']).toBe('example.com');
      expect(tags[0].attrs.src).toBe('https://plausible.io/js/plausible.js');
      expect(tags[0].injectTo).toBe('head');
    });

    it('should use custom apiHost when provided', () => {
      const plugin = analyticsPlugin({
        plausible: { domain: 'example.com', apiHost: 'https://custom.plausible.io' },
      });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags[0].attrs.src).toBe('https://custom.plausible.io/js/plausible.js');
    });
  });

  describe('umami', () => {
    it('should generate correct script with id and src', () => {
      const plugin = analyticsPlugin({
        umami: { id: 'umami-website-id', src: 'https://analytics.example.com/script.js' },
      });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].attrs.defer).toBe(true);
      expect(tags[0].attrs['data-website-id']).toBe('umami-website-id');
      expect(tags[0].attrs.src).toBe('https://analytics.example.com/script.js');
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('ackee', () => {
    it('should generate correct script with server and domainId', () => {
      const plugin = analyticsPlugin({
        ackee: { server: 'https://ackee.example.com', domainId: 'ackee-domain-id' },
      });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].attrs.async).toBe(true);
      expect(tags[0].attrs.src).toBe('https://ackee.example.com/tracker.js');
      expect(tags[0].attrs['data-ackee-server']).toBe('https://ackee.example.com');
      expect(tags[0].attrs['data-ackee-domain-id']).toBe('ackee-domain-id');
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('vercel Analytics', () => {
    it('should generate correct script with id', () => {
      const plugin = analyticsPlugin({ vercel: { id: 'vercel-id' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].attrs.defer).toBe(true);
      expect(tags[0].attrs.src).toBe('https://vercel.analytics.com/script.js');
      expect(tags[0].attrs['data-id']).toBe('vercel-id');
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('ali CNZZ', () => {
    it('should generate correct script with id', () => {
      const plugin = analyticsPlugin({ ali: { id: 'cnzz-site-id' } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].children).toContain('cnzz-site-id');
      expect(tags[0].children).toContain('cnzz_stat_icon');
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('custom Snippet', () => {
    it('should inject raw snippet correctly', () => {
      const customCode = 'console.log("custom analytics");';
      const plugin = analyticsPlugin({ custom: { snippet: customCode } });
      const tags = (plugin!.transformIndexHtml as Function)();

      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('script');
      expect(tags[0].children).toBe(customCode);
      expect(tags[0].injectTo).toBe('head');
    });
  });

  describe('multiple Providers', () => {
    it('should generate scripts for all configured providers', () => {
      const plugin = analyticsPlugin({
        google: { id: 'G-TEST' },
        baidu: { id: 'baidu-id' },
        plausible: { domain: 'example.com' },
      });
      const tags = (plugin!.transformIndexHtml as Function)();

      // Google generates 2 tags, Baidu 1, Plausible 1 = 4 total
      expect(tags).toHaveLength(4);

      // Verify Google tags
      expect(tags[0].attrs.src).toContain('googletagmanager.com');
      expect(tags[1].children).toContain('G-TEST');

      // Verify Baidu tag
      expect(tags[2].children).toContain('baidu-id');

      // Verify Plausible tag
      expect(tags[3].attrs['data-domain']).toBe('example.com');
    });
  });
});
