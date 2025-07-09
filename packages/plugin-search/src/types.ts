/**
 * Options for the Athen search plugin
 */
export interface AlgoliaOptions {
  appId: string;
  apiKey: string;
  indexName: string;
  algoliaOptions?: Record<string, any>;
}

export interface SearchOptions {
  provider?: 'flex' | 'algolia';
  algolia?: AlgoliaOptions;
  /**
   * Function used to transform search results
   */
  transformResult?: (result: SearchResult[]) => SearchResult[];

  /**
   * Custom path for loading search index
   * @default "/search-index"
   */
  searchIndexPath?: string;

  /**
   * Glob patterns of file paths to include in search index
   * @default ["**\/*.md"]
   */
  include?: string[];

  /**
   * Glob patterns of file paths to exclude from search index
   * @default []
   */
  exclude?: string[];

  /**
   * Search options to pass to FlexSearch
   */
  searchOptions?: {
    limit?: number;
    enrich?: boolean;
    suggest?: boolean;
  };

  /**
   * Additional FlexSearch document fields to index
   */
  customFields?: {
    [key: string]: {
      /**
       * Path to the property from the document
       */
      getter: (page: any) => string;
      /**
       * FlexSearch index configuration
       */
      index?: {
        encode?: string | ((str: string) => string);
        tokenize?: string | ((str: string) => string[]);
        resolution?: number;
      };
    };
  };
}

/**
 * Search result item
 */
export interface SearchResult {
  /**
   * Page path
   */
  path: string;
  /**
   * Page title
   */
  title: string;
  /**
   * Heading where match was found
   */
  heading?: string;
  /**
   * Content excerpt where match was found
   */
  content?: string;
}
