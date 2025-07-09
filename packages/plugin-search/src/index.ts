import fs from 'node:fs';
import path from 'node:path';
import { SearchIndexBuilder } from './index-builder';
import type { SearchOptions } from './types';
import type { Plugin } from 'vite';

export { SearchOptions, SearchResult } from './types';

// Virtual module id for the search index
const SEARCH_INDEX_ID = 'virtual:athen-search-index';
const RESOLVED_SEARCH_INDEX_ID = `\0${SEARCH_INDEX_ID}`;

/**
 * Athen search plugin
 */
export default function searchPlugin(options: SearchOptions = {}): Plugin {
  const provider = options.provider || 'flex';
  let indexBuilder: SearchIndexBuilder | undefined;
  let rootDir: string;

  return {
    name: 'athen-plugin-search',

    configResolved(config) {
      rootDir = config.root;
      if (provider === 'flex') {
        indexBuilder = new SearchIndexBuilder(options);
      }
    },

    configureServer(server) {
      if (provider !== 'flex' || !indexBuilder) return;
      const docsDir = path.resolve(rootDir, 'docs');
      if (fs.existsSync(docsDir)) {
        server.watcher.add(path.join(docsDir, '**/*.md'));
        server.watcher.add(path.join(docsDir, '**/*.mdx'));
        indexBuilder.addDocumentsFromDirectory(docsDir, docsDir);
      }
    },

    resolveId(id) {
      if (id === SEARCH_INDEX_ID) {
        return provider === 'flex' ? RESOLVED_SEARCH_INDEX_ID : null;
      }
      return null;
    },

    load(id) {
      if (provider === 'flex' && id === RESOLVED_SEARCH_INDEX_ID && indexBuilder) {
        // Return the serialized index data
        return `export default ${indexBuilder.generateSearchIndex()}`;
      }
      return null;
    },

    // For production build, generate the index file or inject Algolia script
    async closeBundle() {
      if (provider === 'flex') {
        if (!indexBuilder) return;
        const docsDir = path.resolve(rootDir, 'docs');
        if (fs.existsSync(docsDir)) {
          indexBuilder.addDocumentsFromDirectory(docsDir, docsDir);
          const outDir = path.resolve(rootDir, 'dist');
          const indexPath = options.searchIndexPath || '/search-index';
          const indexFile = path.join(outDir, `${indexPath}.json`);
          const indexDir = path.dirname(indexFile);
          if (!fs.existsSync(indexDir)) {
            fs.mkdirSync(indexDir, { recursive: true });
          }
          fs.writeFileSync(indexFile, indexBuilder.generateSearchIndex(), 'utf-8');
        }
      }
    },

    transformIndexHtml(html) {
      if (provider === 'algolia' && options.algolia) {
        const { appId, apiKey, indexName, algoliaOptions } = options.algolia;
        const opts = algoliaOptions ? JSON.stringify(algoliaOptions) : '{}';
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
            children: `docsearch({appId:'${appId}',apiKey:'${apiKey}',indexName:'${indexName}',container:'#docsearch',${opts.slice(1, -1)}});`,
            injectTo: 'body',
          },
        ];
      }
      return undefined;
    },
  };
}

// Client API for searching
export const useSearch = `
import { ref } from 'essor';
import searchIndex from '${SEARCH_INDEX_ID}';

export function useSearch() {
  const results = ref([]);
  const loading = ref(false);
  const query = ref('');

  const search = async (searchQuery) => {
    if (!searchQuery.trim()) {
      results.value = [];
      return;
    }

    query.value = searchQuery;
    loading.value = true;

    try {
      // Create FlexSearch index with stored documents
      const { index, documents } = await import('flexsearch');
      const searchIndex = FlexSearch.create({
        doc: {
          id: 'id',
          field: ['title', 'content', 'headings'],
          store: ['path', 'title']
        }
      });

      // Load documents
      for (const doc of documents) {
        searchIndex.add(doc);
      }

      // Perform search
      const rawResults = searchIndex.search(searchQuery, searchOptions);
      results.value = transformResults(rawResults);
    } catch (err) {
      console.error('Search error:', err);
      results.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    search,
    results,
    loading,
    query
  };
}
`;
