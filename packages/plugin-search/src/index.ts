import fs from 'node:fs';
import path from 'node:path';
import { SearchIndexBuilder } from './index-builder';
import type { SearchOptions } from './types';
import type { Plugin } from 'vite';

export type {
  SearchOptions,
  SearchResult,
  AlgoliaOptions,
  CacheOptions,
  FlexSearchOptions,
  SearchDocument,
  SearchIndexData,
} from './types';
export { SearchIndexBuilder } from './index-builder';

const DEFAULT_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Athen 搜索插件
 * 搜索索引内联到 HTML，客户端使用 IndexedDB 缓存
 */
export default function searchPlugin(options: SearchOptions = {}): Plugin {
  const provider = options.provider || 'flex';
  let indexBuilder: SearchIndexBuilder | undefined;
  let rootDir: string;
  let searchIndexJson = '';

  return {
    name: 'athen-plugin-search',

    configResolved(config) {
      // Use options.root if provided (from athen), otherwise fall back to Vite's config.root
      rootDir = options.root || config.root;

      if (provider === 'flex') {
        indexBuilder = new SearchIndexBuilder(options);
        // rootDir is already the docs directory (e.g., when running `athen dev docs`)
        // Check if rootDir itself contains markdown files, otherwise try rootDir/docs
        let hasMarkdownFiles = false;
        if (fs.existsSync(rootDir)) {
          const files = fs.readdirSync(rootDir, { recursive: true });
          hasMarkdownFiles = files.some((f: any) => {
            const fileName = typeof f === 'string' ? f : f.toString();
            return fileName.endsWith('.md') || fileName.endsWith('.mdx');
          });
        }

        let docsDir = rootDir;
        if (!hasMarkdownFiles) {
          // Fallback: check if there's a docs subdirectory
          const subDocsDir = path.resolve(rootDir, 'docs');
          if (fs.existsSync(subDocsDir)) {
            docsDir = subDocsDir;
          }
        }

        if (fs.existsSync(docsDir)) {
          indexBuilder.addDocumentsFromDirectory(docsDir, docsDir);
          searchIndexJson = indexBuilder.generateSearchIndex();
        }
      }
    },

    transformIndexHtml() {
      const cacheConfig = options.cache || {};

      if (provider === 'algolia' && options.algolia) {
        const { appId, apiKey, indexName, algoliaOptions } = options.algolia;
        return [
          {
            tag: 'link',
            attrs: { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@docsearch/css@3' },
            injectTo: 'head',
          },
          {
            tag: 'script',
            attrs: { src: 'https://cdn.jsdelivr.net/npm/@docsearch/js@3' },
            injectTo: 'head',
          },
          {
            tag: 'script',
            children: `window.__ATHEN_SEARCH_CONFIG__=${JSON.stringify({ provider: 'algolia', algolia: { appId, apiKey, indexName, ...algoliaOptions } })};`,
            injectTo: 'head',
          },
        ];
      }

      return [
        {
          tag: 'script',
          children: `window.__ATHEN_SEARCH_CONFIG__=${JSON.stringify({ provider: 'flex', cache: { enabled: cacheConfig.enabled !== false, maxAge: cacheConfig.maxAge || DEFAULT_CACHE_MAX_AGE } })};window.__ATHEN_SEARCH_INDEX__=${searchIndexJson};`,
          injectTo: 'head',
        },
      ];
    },
  };
}
