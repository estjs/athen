import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlgoliaSearcher } from '../../src/client/AlgoliaSearcher';

const searchSingleIndex = vi.hoisted(() => vi.fn());
const algoliasearch = vi.hoisted(() =>
  vi.fn(() => ({
    searchSingleIndex,
  })),
);

vi.mock('algoliasearch', () => ({
  algoliasearch,
}));

describe('AlgoliaSearcher', () => {
  let consoleError: any;

  beforeEach(() => {
    searchSingleIndex.mockReset();
    algoliasearch.mockClear();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('lazy-imports algoliasearch on first search', async () => {
    searchSingleIndex.mockResolvedValueOnce({ hits: [] });
    const searcher = new AlgoliaSearcher({
      appId: 'app',
      apiKey: 'key',
      indexName: 'docs',
    });

    expect(algoliasearch).not.toHaveBeenCalled();
    await searcher.search('hello');
    expect(algoliasearch).toHaveBeenCalledWith('app', 'key');
  });

  it('returns an empty array for empty / whitespace queries', async () => {
    const searcher = new AlgoliaSearcher({ appId: 'a', apiKey: 'k', indexName: 'i' });
    searchSingleIndex.mockResolvedValue({ hits: [] });

    expect(await searcher.search('')).toEqual([]);
    expect(await searcher.search('   ')).toEqual([]);
  });

  it('maps Algolia hits to the SearchResult shape', async () => {
    searchSingleIndex.mockResolvedValueOnce({
      hits: [
        {
          url: '/guide/install',
          title: 'Install',
          hierarchy: { lvl0: 'Guide', lvl1: 'Install' },
          content: 'install instructions',
        },
        {
          path: '/api',
          hierarchy: { lvl0: 'API', lvl2: 'Detail' },
          _snippetResult: { content: { value: 'snippet' } },
        },
      ],
    });

    const searcher = new AlgoliaSearcher({ appId: 'a', apiKey: 'k', indexName: 'i' });
    const results = await searcher.search('install');

    expect(results).toEqual([
      { path: '/guide/install', title: 'Install', heading: 'Install', content: 'install instructions' },
      { path: '/api', title: 'API', heading: 'Detail', content: 'snippet' },
    ]);
  });

  it('passes algoliaOptions through to index.search', async () => {
    searchSingleIndex.mockResolvedValueOnce({ hits: [] });
    const searcher = new AlgoliaSearcher({
      appId: 'a',
      apiKey: 'k',
      indexName: 'i',
      algoliaOptions: { facetFilters: ['lang:en'] },
    });

    await searcher.search('hello');
    expect(searchSingleIndex).toHaveBeenCalledWith(
      expect.objectContaining({
        indexName: 'i',
        searchParams: expect.objectContaining({
          query: 'hello',
          hitsPerPage: 7,
          facetFilters: ['lang:en'],
        }),
      }),
    );
  });

  it('returns an empty array and logs when the index throws', async () => {
    searchSingleIndex.mockRejectedValueOnce(new Error('upstream 500'));
    const searcher = new AlgoliaSearcher({ appId: 'a', apiKey: 'k', indexName: 'i' });

    expect(await searcher.search('boom')).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });
});
