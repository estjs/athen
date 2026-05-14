import FlexSearch from 'flexsearch';
import type { SearchDocument, SearchOptions, SearchResult } from './types';

export const DEFAULT_SEARCH_LIMIT = 7;

const CJK_REGEX =
  /[\u3131-\u314E|\u314F-\u3163\uAC00-\uD7A3\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\u3041-\u3096\u30A1-\u30FA]|[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]/gu;

type SearchIndex = {
  add: (doc: SearchDocument) => void;
  search: (query: string, options: { limit: number }) => unknown | Promise<unknown>;
};

export interface SearchIndexes {
  index: SearchIndex;
  cjkIndex: SearchIndex;
}

function tokenizeCjk(value: string) {
  const words: string[] = [];
  let match: RegExpExecArray | null;
  CJK_REGEX.lastIndex = 0;
  while ((match = CJK_REGEX.exec(value))) {
    words.push(match[0]);
  }
  return words;
}

export function createSearchIndexes(storeContent = false): SearchIndexes {
  const store = ['path', 'title', 'headings', 'rawHeaders'];
  if (storeContent) {
    store.push('content');
  }

  const options = {
    preset: 'score',
    tokenize: 'forward',
    resolution: 9,
    document: {
      id: 'id',
      field: ['title', 'headings', 'content'],
      store,
    },
  };

  const Document = FlexSearch.Document as new (options: unknown) => SearchIndex;

  return {
    index: new Document(options),
    cjkIndex: new Document({
      ...options,
      encode: false,
      tokenize: tokenizeCjk,
    }),
  };
}

function normalizeSearchIds(result: unknown): number[] {
  if (!Array.isArray(result)) {
    return [];
  }

  return result.flatMap(item => {
    if (typeof item === 'number') {
      return [item];
    }
    if (item && typeof item === 'object' && 'result' in item) {
      const ids = (item as { result?: unknown }).result;
      return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : [];
    }
    return [];
  });
}

function createSnippet(content: string, query: string) {
  const index = content.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return '';
  }

  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + query.length + 40);
  return `${start > 0 ? '...' : ''}${content.slice(start, end)}${end < content.length ? '...' : ''}`;
}

function withLanguagePrefix(path: string, prefix?: string) {
  if (!prefix) {
    return path;
  }

  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  if (path.startsWith(normalizedPrefix) || /^\/[a-z]{2}(-[A-Z]{2})?\//i.test(path)) {
    return path;
  }

  return normalizedPrefix + path.replace(/^\//, '');
}

function isPathForLocale(path: string, localePrefix?: string) {
  if (!localePrefix) {
    return true;
  }

  const hasLangPrefix = /^\/[a-z]{2}(-[A-Z]{2})?\//i.test(path);

  if (localePrefix !== '/') {
    const normalizedPrefix = localePrefix.endsWith('/') ? localePrefix : `${localePrefix}/`;
    if (path.startsWith(normalizedPrefix)) return true;
    if (hasLangPrefix) return false;
    return true; // No prefix -> default locale -> will be prefixed
  } else {
    return !hasLangPrefix;
  }
}

export async function searchDocuments(
  indexes: SearchIndexes,
  documents: SearchDocument[],
  query: string,
  options: { limit?: number; langRoutePrefix?: string } = {},
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const limit = options.limit || DEFAULT_SEARCH_LIMIT;
  const [latin, cjk] = await Promise.all([
    indexes.index.search(query, { limit: limit * 5 }),
    indexes.cjkIndex.search(query, { limit: limit * 5 }),
  ]);
  const unique = new Map<number, SearchDocument>();
  const seenPaths = new Set<string>();

  for (const id of [...normalizeSearchIds(latin), ...normalizeSearchIds(cjk)]) {
    const doc = documents.find(item => item.id === id);
    if (doc && isPathForLocale(doc.path, options.langRoutePrefix)) {
      const finalPath = withLanguagePrefix(doc.path, options.langRoutePrefix);
      if (!seenPaths.has(finalPath)) {
        seenPaths.add(finalPath);
        unique.set(doc.id, doc);
      }
    }
  }

  return Array.from(unique.values())
    .slice(0, limit)
    .map(doc => ({
      path: withLanguagePrefix(doc.path, options.langRoutePrefix),
      title: doc.title,
      heading: doc.headings.find(item => item.toLowerCase().includes(query.toLowerCase())) || '',
      content: doc.content ? createSnippet(doc.content, query) : '',
    }));
}

export function normalizeDocumentPath(filePath: string): string {
  const path = filePath.replaceAll('\\', '/').replace(/\.(md|mdx)$/, '').replace(/\/index$/, '/');
  return path.startsWith('/') ? path : `/${path}`;
}

export function matchesGlob(pattern: string, value: string): boolean {
  if (pattern === value) return true;
  if (pattern === '**/*.md') return value.endsWith('.md');
  if (pattern === '**/*.mdx') return value.endsWith('.mdx');
  if (pattern.includes('**/') && pattern.includes('/**')) {
    const middle = pattern.replace(/^\*\*\//, '').replace(/\/\*\*$/, '');
    return value.includes(`${middle}/`);
  }

  const regexPattern = pattern
    .replaceAll('.', '\\.')
    .replaceAll('**', '.*')
    .replaceAll('*', '[^/]*')
    .replaceAll('?', '.');
  return new RegExp(`^${regexPattern}$`).test(value);
}

export function resolveSearchLimit(options: SearchOptions, fallback = DEFAULT_SEARCH_LIMIT) {
  return options.searchOptions?.limit || fallback;
}
