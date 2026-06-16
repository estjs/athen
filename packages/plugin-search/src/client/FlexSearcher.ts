import {
  DEFAULT_SEARCH_LIMIT,
  type SearchIndexes,
  createSearchIndexes,
  searchDocuments,
} from '../search-core';
import { SearchIndexCache } from './SearchIndexCache';
import type { SearchIndexData, SearchResult } from '../types';

export interface FlexSearcherOptions {
  langRoutePrefix?: string;
  cacheEnabled?: boolean;
  cacheMaxAge?: number;
  maxResults?: number;
}

declare global {
  interface Window {
    __ATHEN_SEARCH_INDEX__?: SearchIndexData;
  }
}

export class FlexSearcher {
  // Assigned in `init()` (both the success and catch paths), which every
  // `search()` awaits before use — so no construction-time index build needed.
  private indexes!: SearchIndexes;
  private documents: SearchIndexData['documents'] = [];
  private initialized = false;
  private cache: SearchIndexCache | null = null;
  private options: FlexSearcherOptions;
  private cacheKey: string;

  constructor(options: FlexSearcherOptions = {}) {
    this.options = options;
    if (this.options.cacheEnabled !== false && typeof window !== 'undefined') {
      this.cache = new SearchIndexCache({ maxAge: this.options.cacheMaxAge });
    }
    this.cacheKey =
      typeof window !== 'undefined' ? `search-index-${window.location.origin}` : 'search-index';
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      let indexData: SearchIndexData | null = null;
      if (typeof window !== 'undefined' && window.__ATHEN_SEARCH_INDEX__) {
        indexData = window.__ATHEN_SEARCH_INDEX__;
        if (this.cache && indexData) await this.cache.set(this.cacheKey, indexData);
      } else if (this.cache) {
        indexData = await this.cache.get<SearchIndexData>(this.cacheKey);
      }
      this.documents = indexData?.documents || [];
      this.indexes = createSearchIndexes(true);
      for (const doc of this.documents) {
        this.indexes.index.add(doc);
        this.indexes.cjkIndex.add(doc);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FlexSearcher:', error);
      this.documents = [];
      this.indexes = createSearchIndexes(true);
      this.initialized = true;
    }
  }

  async clearCache(): Promise<void> {
    if (this.cache) await this.cache.clear();
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.initialized) await this.init();
    try {
      return await searchDocuments(this.indexes, this.documents, query, {
        limit: this.options.maxResults ?? DEFAULT_SEARCH_LIMIT,
        langRoutePrefix: this.options.langRoutePrefix,
      });
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  getDocuments() {
    return this.documents;
  }
  isInitialized() {
    return this.initialized;
  }
}
