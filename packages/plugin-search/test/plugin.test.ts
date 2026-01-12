import { beforeEach, describe, expect, it, vi } from 'vitest';
import searchPlugin from '../src/index';

// Mock fs and path
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({ isDirectory: () => false })),
    readFileSync: vi.fn(() => ''),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

describe('searchPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create plugin with default options', () => {
    const plugin = searchPlugin();
    expect(plugin.name).toBe('athen-plugin-search');
  });

  it('should create plugin with flex provider by default', () => {
    const plugin = searchPlugin();
    expect(plugin.name).toBe('athen-plugin-search');
  });

  it('should accept algolia provider', () => {
    const plugin = searchPlugin({
      provider: 'algolia',
      algolia: {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        indexName: 'test-index',
      },
    });
    expect(plugin.name).toBe('athen-plugin-search');
  });

  describe('transformIndexHtml', () => {
    it('should inject flex search config', () => {
      const plugin = searchPlugin();

      // Simulate configResolved
      (plugin as any).configResolved({ root: '/test' });

      const result = (plugin as any).transformIndexHtml();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].tag).toBe('script');
      expect(result[0].children).toContain('__ATHEN_SEARCH_CONFIG__');
      expect(result[0].children).toContain('__ATHEN_SEARCH_INDEX__');
    });

    it('should inject algolia config and scripts', () => {
      const plugin = searchPlugin({
        provider: 'algolia',
        algolia: {
          appId: 'test-app-id',
          apiKey: 'test-api-key',
          indexName: 'test-index',
        },
      });

      (plugin as any).configResolved({ root: '/test' });

      const result = (plugin as any).transformIndexHtml();
      expect(result.length).toBe(3);
      expect(result[0].tag).toBe('link');
      expect(result[1].tag).toBe('script');
      expect(result[2].children).toContain('algolia');
    });

    it('should include cache config in flex mode', () => {
      const plugin = searchPlugin({
        cache: {
          enabled: true,
          maxAge: 3600000,
        },
      });

      (plugin as any).configResolved({ root: '/test' });

      const result = (plugin as any).transformIndexHtml();
      expect(result[0].children).toContain('cache');
      expect(result[0].children).toContain('3600000');
    });

    it('should use default cache maxAge', () => {
      const plugin = searchPlugin();

      (plugin as any).configResolved({ root: '/test' });

      const result = (plugin as any).transformIndexHtml();
      // Default is 24 hours = 86400000ms
      expect(result[0].children).toContain('86400000');
    });
  });
});
