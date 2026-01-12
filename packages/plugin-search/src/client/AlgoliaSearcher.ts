import type { SearchResult } from '../types';

export interface AlgoliaConfig {
  appId: string;
  apiKey: string;
  indexName: string;
  algoliaOptions?: Record<string, any>;
}

export class AlgoliaSearcher {
  private client: any;
  private index: any;
  private config: AlgoliaConfig;
  private initialized = false;

  constructor(config: AlgoliaConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const { algoliasearch } = await import('algoliasearch');
      this.client = algoliasearch(this.config.appId, this.config.apiKey);
      this.index = this.client.initIndex(this.config.indexName);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AlgoliaSearcher:', error);
      throw error;
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.initialized) await this.init();
    if (!query.trim()) return [];
    try {
      const response = await this.index.search(query, { hitsPerPage: 7, ...this.config.algoliaOptions });
      return response.hits.map((hit: any) => ({
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
