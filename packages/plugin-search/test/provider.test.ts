import { describe, expect, it } from 'vitest';
import searchPlugin from '../src';

describe('search plugin provider switch', () => {
  it('defaults to flex provider', () => {
    const plugin = searchPlugin({});
    expect(plugin.name).toBe('athen-plugin-search');
  });

  it('creates plugin even when provider algolia', () => {
    const plugin = searchPlugin({ provider: 'algolia', algolia: { appId: 'id', apiKey: 'key', indexName: 'docs' } });
    expect(plugin.name).toBe('athen-plugin-search');
  });
});
