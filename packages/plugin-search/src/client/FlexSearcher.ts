import FlexSearch from 'flexsearch';
import { SearchIndexCache } from './SearchIndexCache';
import type { SearchResult } from '../types';

export interface SearchIndexData {
  documents: Array<{
    id: number;
    path: string;
    title: string;
    headings: string[];
    content: string;
    rawHeaders?: any[];
  }>;
  options: any;
}

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

const DEFAULT_MAX_RESULTS = 7;
const CJK_REGEX =
  /[\u3131-\u314E|\u314F-\u3163\uAC00-\uD7A3\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\u3041-\u3096\u30A1-\u30FA]|[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]/gu;

export class FlexSearcher {
  private index: any;
  private cjkIndex: any;
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
      if (this.cache) indexData = await this.cache.get<SearchIndexData>(this.cacheKey);
      if (!indexData && typeof window !== 'undefined' && window.__ATHEN_SEARCH_INDEX__) {
        indexData = window.__ATHEN_SEARCH_INDEX__;
        if (this.cache && indexData) await this.cache.set(this.cacheKey, indexData);
      }
      this.documents = indexData?.documents || [];
      this.initializeIndexes();
      for (const doc of this.documents) {
        this.index.add(doc);
        this.cjkIndex.add(doc);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FlexSearcher:', error);
      this.documents = [];
      this.initializeIndexes();
      this.initialized = true;
    }
  }

  async clearCache(): Promise<void> {
    if (this.cache) await this.cache.clear();
  }

  private initializeIndexes() {
    const opts: any = {
      preset: 'score',
      tokenize: 'forward',
      resolution: 9,
      document: {
        id: 'id',
        field: ['title', 'headings', 'content'],
        store: ['path', 'title', 'headings', 'rawHeaders', 'content'],
      },
    };
    this.index = new FlexSearch.Document(opts);
    this.cjkIndex = new FlexSearch.Document({
      ...opts,
      encode: false as any,
      tokenize: ((str: string) => {
        const words: string[] = [];
        let m: RegExpExecArray | null;
        CJK_REGEX.lastIndex = 0;
        while ((m = CJK_REGEX.exec(str))) words.push(m[0]);
        return words;
      }) as any,
    });
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.initialized) await this.init();
    if (!query.trim()) return [];
    const maxResults = this.options.maxResults ?? DEFAULT_MAX_RESULTS;
    try {
      const [eng, cjk] = await Promise.all([
        this.index.search(query, { limit: maxResults }),
        this.cjkIndex.search(query, { limit: maxResults }),
      ]);
      const normalize = (r: any) =>
        Array.isArray(r) ? r.flatMap(x => (Array.isArray(x?.result) ? x.result : x)) : [];
      const unique = new Map<number, any>();
      [...normalize(eng), ...normalize(cjk)].forEach((id: any) => {
        const doc = this.documents.find(d => d.id === id);
        if (doc) unique.set(doc.id, doc);
      });
      return Array.from(unique.values())
        .slice(0, maxResults)
        .map(doc => {
          let content = '',
            heading = '';
          if (doc.content) {
            const idx = doc.content.toLowerCase().indexOf(query.toLowerCase());
            if (idx !== -1) {
              const s = Math.max(0, idx - 40),
                e = Math.min(doc.content.length, idx + query.length + 40);
              content =
                (s > 0 ? '...' : '') +
                doc.content.slice(s, e) +
                (e < doc.content.length ? '...' : '');
            }
          }
          if (doc.headings) {
            const m = doc.headings.find((h: string) =>
              h.toLowerCase().includes(query.toLowerCase()),
            );
            if (m) heading = m;
          }
          let resultPath = doc.path;
          // Only add langRoutePrefix if the path doesn't already start with it
          // and the path doesn't start with any language prefix (e.g., /en/, /zh/)
          if (this.options.langRoutePrefix) {
            const prefix = this.options.langRoutePrefix.endsWith('/')
              ? this.options.langRoutePrefix
              : `${this.options.langRoutePrefix}/`;
            // Check if path already has a language prefix that matches
            if (!resultPath.startsWith(prefix)) {
              // Only add prefix if the path doesn't already have a language-like prefix
              // (paths like /en/..., /zh/... should not get another prefix)
              const hasLangPrefix = /^\/[a-z]{2}(-[A-Z]{2})?\//i.test(resultPath);
              if (!hasLangPrefix) {
                resultPath = prefix + resultPath.replace(/^\//, '');
              }
            }
          }
          return { path: resultPath, title: doc.title, heading, content };
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
