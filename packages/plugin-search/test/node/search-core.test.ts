import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SEARCH_LIMIT,
  createSearchIndexes,
  matchesGlob,
  normalizeDocumentPath,
  resolveSearchLimit,
  searchDocuments,
} from '../../src/search-core';
import type { SearchDocument } from '../../src/types';

describe('matchesGlob', () => {
  it('matches exact strings', () => {
    expect(matchesGlob('foo.md', 'foo.md')).toBe(true);
    expect(matchesGlob('foo.md', 'bar.md')).toBe(false);
  });

  it('matches the well-known **/*.md and **/*.mdx shortcuts', () => {
    expect(matchesGlob('**/*.md', 'a/b/c.md')).toBe(true);
    expect(matchesGlob('**/*.mdx', 'a/b/c.mdx')).toBe(true);
    expect(matchesGlob('**/*.md', 'a/b/c.mdx')).toBe(false);
  });

  it('matches **/middle/** for nested directories', () => {
    expect(matchesGlob('**/draft/**', 'docs/draft/intro.md')).toBe(true);
    expect(matchesGlob('**/draft/**', 'docs/private/intro.md')).toBe(false);
  });

  it('converts simple glob syntax to regex matching', () => {
    expect(matchesGlob('docs/*.md', 'docs/guide.md')).toBe(true);
    expect(matchesGlob('docs/*.md', 'docs/sub/guide.md')).toBe(false);
  });
});

describe('normalizeDocumentPath', () => {
  it('strips .md and .mdx extensions and forces a leading slash', () => {
    expect(normalizeDocumentPath('guide/intro.md')).toBe('/guide/intro');
    expect(normalizeDocumentPath('/guide/intro.mdx')).toBe('/guide/intro');
  });

  it('rewrites /index suffix to a directory-style url', () => {
    expect(normalizeDocumentPath('guide/index.md')).toBe('/guide/');
  });

  it('handles Windows backslashes', () => {
    expect(normalizeDocumentPath('guide\\intro\\index.md')).toBe('/guide/intro/');
  });

  it('drops the default locale prefix when configured', () => {
    expect(normalizeDocumentPath('en/guide/intro.md', '/en/')).toBe('/guide/intro');
  });

  it('keeps non-default locale paths untouched', () => {
    expect(normalizeDocumentPath('zh/guide/intro.md', '/en/')).toBe('/zh/guide/intro');
  });
});

describe('resolveSearchLimit', () => {
  it('uses options.searchOptions.limit when present', () => {
    expect(resolveSearchLimit({ searchOptions: { limit: 12 } })).toBe(12);
  });

  it('falls back to DEFAULT_SEARCH_LIMIT', () => {
    expect(resolveSearchLimit({})).toBe(DEFAULT_SEARCH_LIMIT);
    expect(DEFAULT_SEARCH_LIMIT).toBeGreaterThan(0);
  });

  it('honors a custom fallback', () => {
    expect(resolveSearchLimit({}, 3)).toBe(3);
  });
});

describe('searchDocuments', () => {
  const documents: SearchDocument[] = [
    {
      id: 1,
      path: '/guide/intro',
      title: 'Intro',
      headings: ['Welcome', 'Getting Started'],
      rawHeaders: [],
      content: 'A friendly welcome to the project documentation.',
    },
    {
      id: 2,
      path: '/zh/guide/intro',
      title: '介绍',
      headings: ['欢迎'],
      rawHeaders: [],
      content: '中文介绍内容',
    },
  ];

  function index() {
    const indexes = createSearchIndexes(true);
    for (const doc of documents) {
      indexes.index.add(doc);
      indexes.cjkIndex.add(doc);
    }
    return indexes;
  }

  it('returns an empty list for an empty query', async () => {
    expect(await searchDocuments(index(), documents, '')).toEqual([]);
    expect(await searchDocuments(index(), documents, '   ')).toEqual([]);
  });

  it('produces a snippet around the matched query', async () => {
    const results = await searchDocuments(index(), documents, 'welcome');
    expect(results[0].path).toBe('/guide/intro');
    expect(results[0].content.toLowerCase()).toContain('welcome');
  });

  it('filters out non-locale docs when langRoutePrefix is /', async () => {
    const results = await searchDocuments(index(), documents, '介绍', { langRoutePrefix: '/' });
    expect(results.every((r) => !r.path.startsWith('/zh'))).toBe(true);
  });

  it('keeps only locale-prefixed docs when langRoutePrefix matches', async () => {
    const results = await searchDocuments(index(), documents, '介绍', { langRoutePrefix: '/zh/' });
    expect(results[0].path).toBe('/zh/guide/intro');
  });
});
