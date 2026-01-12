/** Algolia 搜索配置 */
export interface AlgoliaOptions {
  appId: string;
  apiKey: string;
  indexName: string;
  algoliaOptions?: Record<string, any>;
}

/** IndexedDB 缓存配置 */
export interface CacheOptions {
  enabled?: boolean;
  maxAge?: number;
}

/** FlexSearch 索引选项 */
export interface FlexSearchOptions {
  limit?: number;
  suggest?: boolean;
  enrich?: boolean;
}

/** 搜索插件配置 */
export interface SearchOptions {
  provider?: 'flex' | 'algolia';
  algolia?: AlgoliaOptions;
  searchIndexPath?: string;
  include?: string[];
  exclude?: string[];
  searchOptions?: FlexSearchOptions;
  cache?: CacheOptions;
  transformResult?: (results: SearchResult[]) => SearchResult[];
  customFields?: Record<
    string,
    {
      getter: (page: any) => string;
      index?: {
        encode?: string | ((str: string) => string);
        tokenize?: string | ((str: string) => string[]);
        resolution?: number;
      };
    }
  >;
  /** Root directory for docs (passed by athen) */
  root?: string;
}

/** 搜索结果 */
export interface SearchResult {
  path: string;
  title: string;
  heading?: string;
  content?: string;
}

/** 搜索文档 */
export interface SearchDocument {
  id: number;
  path: string;
  title: string;
  headings: string[];
  content: string;
  rawHeaders?: Array<{ id: string; text: string; depth: number }>;
}

/** 搜索索引数据 */
export interface SearchIndexData {
  documents: SearchDocument[];
  options: SearchOptions;
}
