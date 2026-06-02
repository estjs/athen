import type { SearchResult } from '../types';

export interface AlgoliaConfig {
  appId: string;
  apiKey: string;
  indexName: string;
  algoliaOptions?: Record<string, unknown>;
}

interface AlgoliaHit {
  url?: string;
  path?: string;
  title?: string;
  hierarchy?: { lvl0?: string; lvl1?: string; lvl2?: string };
  content?: string;
  _snippetResult?: { content?: { value?: string } };
}

interface AlgoliaSearchClient {
  searchSingleIndex<T>(params: {
    indexName: string;
    searchParams?: Record<string, unknown>;
  }): Promise<{ hits: T[] }>;
}

export class AlgoliaSearcher {
  private client: AlgoliaSearchClient | undefined;
  private config: AlgoliaConfig;
  private initialized = false;

  constructor(config: AlgoliaConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const { algoliasearch } = await import('algoliasearch');
      // The full SearchClient surface is large; cast at the library boundary to
      // the minimal `searchSingleIndex` shape this searcher uses (algoliasearch
      // v5 API — the legacy `initIndex` was removed).
      this.client = algoliasearch(
        this.config.appId,
        this.config.apiKey,
      ) as unknown as AlgoliaSearchClient;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AlgoliaSearcher:', error);
      throw error;
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.initialized) await this.init();
    if (!query.trim() || !this.client) return [];
    try {
      const response = await this.client.searchSingleIndex<AlgoliaHit>({
        indexName: this.config.indexName,
        searchParams: { query, hitsPerPage: 7, ...this.config.algoliaOptions },
      });
      return response.hits.map((hit) => ({
        path: hit.url || hit.path || '',
        title: hit.title || hit.hierarchy?.lvl0 || '',
        heading: hit.hierarchy?.lvl1 || hit.hierarchy?.lvl2 || '',
        content: hit.content || hit._snippetResult?.content?.value || '',
      }));
    } catch (error) {
      console.error('Algolia search error:', error);
      return [];
    }
  }
}
