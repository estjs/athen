import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlexSearcher } from '../src/client/FlexSearcher';
import type { SearchIndexData } from '../src/types';

const cache = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('../src/client/SearchIndexCache', () => ({
  SearchIndexCache: vi.fn(function () {
    return cache;
  }),
}));

const staleIndex: SearchIndexData = {
  documents: [
    {
      id: 1,
      path: '/old',
      title: 'Old',
      headings: [],
      content: 'stale cached content',
    },
  ],
  options: {},
};

const freshIndex: SearchIndexData = {
  documents: [
    {
      id: 1,
      path: '/fresh',
      title: 'Fresh',
      headings: [],
      content: 'fresh inline content',
    },
  ],
  options: {},
};

describe('flexSearcher', () => {
  beforeEach(() => {
    cache.get.mockResolvedValue(staleIndex);
    cache.set.mockResolvedValue(undefined);
    cache.clear.mockResolvedValue(undefined);
    (globalThis as any).window = {
      location: { origin: 'https://athen.test' },
      __ATHEN_SEARCH_INDEX__: freshIndex,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (globalThis as any).window;
  });

  it('uses the current inline search index before stale cache', async () => {
    const searcher = new FlexSearcher();

    const results = await searcher.search('fresh');

    expect(results[0]?.path).toBe('/fresh');
    expect(cache.set).toHaveBeenCalledWith('search-index-https://athen.test', freshIndex);
  });
});
