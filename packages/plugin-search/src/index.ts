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
 * Escape a JSON string for safe embedding inside an inline `<script>` body.
 * `JSON.stringify` does not escape `<`, so a document containing the literal
 * `</script>` would otherwise close the tag early (breaking search and opening
 * an HTML-injection vector). Also neutralizes the JS line/paragraph separators.
 */
function escapeJsonForScript(json: string): string {
  return json
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

/**
 * Athen 搜索插件
 * 搜索索引内联到 HTML，客户端使用 IndexedDB 缓存
 */
export default function searchPlugin(options: SearchOptions = {}): Plugin {
  const provider = options.provider || 'flex';
  let indexBuilder: SearchIndexBuilder | undefined;
  let rootDir: string;
  let searchIndexJson = '';
  let initialized = false;

  const getSearchIndex = () => {
    if (initialized) return searchIndexJson;
    initialized = true;

    if (provider === 'flex' && indexBuilder) {
      // rootDir is already the docs directory (e.g., when running `athen dev docs`)
      // Check if rootDir itself contains markdown files, otherwise try rootDir/docs
      const hasMarkdown = (dir: string): boolean => {
        if (!fs.existsSync(dir)) return false;
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (['node_modules', '.git', '.temp', 'dist', 'build'].includes(file)) continue;
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              if (hasMarkdown(fullPath)) return true;
            } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
              return true;
            }
          }
        } catch {}
        return false;
      };
      const hasMarkdownFiles = hasMarkdown(rootDir);

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
    return searchIndexJson;
  };

  return {
    name: 'athen-plugin-search',

    configResolved(config) {
      // Use options.root if provided (from athen), otherwise fall back to Vite's config.root
      rootDir = options.root || config.root;

      if (provider === 'flex') {
        indexBuilder = new SearchIndexBuilder(options);
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
            children: '',
            injectTo: 'head',
          },
          {
            tag: 'script',
            children: `window.__ATHEN_SEARCH_CONFIG__=${escapeJsonForScript(JSON.stringify({ provider: 'algolia', algolia: { appId, apiKey, indexName, ...algoliaOptions } }))};`,
            injectTo: 'head',
          },
        ];
      }

      return [
        {
          tag: 'script',
          children: `window.__ATHEN_SEARCH_CONFIG__=${escapeJsonForScript(JSON.stringify({ provider: 'flex', cache: { enabled: cacheConfig.enabled !== false, maxAge: cacheConfig.maxAge || DEFAULT_CACHE_MAX_AGE } }))};window.__ATHEN_SEARCH_INDEX__=${escapeJsonForScript(getSearchIndex())};`,
          injectTo: 'head',
        },
      ];
    },
  };
}
