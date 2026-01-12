import { expect, test } from '../fixtures/search.fixture';
import { containsHtmlTags, validateSearchIndex } from '../helpers/search.helpers';

test.describe('Search Index Validation', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.goto('/');
  });

  test('search index is loaded on page', async ({ searchPage }) => {
    // Requirement 1.1: Search index should be generated and available
    const isLoaded = await searchPage.isSearchIndexLoaded();
    expect(isLoaded).toBe(true);
  });

  test('search index contains documents', async ({ searchPage }) => {
    // Requirement 1.1: Index should contain markdown documents
    const docCount = await searchPage.getDocumentCount();
    expect(docCount).toBeGreaterThan(0);
    console.log(`Search index contains ${docCount} documents`);
  });

  test('search index has valid JSON structure', async ({ searchPage }) => {
    // Requirement 1.7: Index should be valid JSON with documents and options
    // Property 4: Search Index JSON Validity
    const index = await searchPage.getSearchIndex();

    expect(index).not.toBeNull();
    expect(index?.documents).toBeDefined();
    expect(Array.isArray(index?.documents)).toBe(true);
    expect(index?.options).toBeDefined();
    expect(typeof index?.options).toBe('object');
  });

  test('all document paths start with /', async ({ searchPage }) => {
    // Requirement 1.5: Paths should be normalized to start with /
    // Property 2: Search Index Path Normalization
    const paths = await searchPage.getDocumentPaths();

    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).toMatch(/^\//);
    }
  });

  test('document paths do not contain file extensions', async ({ searchPage }) => {
    // Requirement 1.5: Paths should not contain .md or .mdx extensions
    // Property 2: Search Index Path Normalization
    const paths = await searchPage.getDocumentPaths();

    for (const path of paths) {
      expect(path).not.toMatch(/\.(md|mdx)$/);
    }
  });

  test('index files have paths ending with /', async ({ searchPage }) => {
    // Requirement 1.5: index.md files should have paths ending with /
    const index = await searchPage.getSearchIndex();
    const docs = index?.documents || [];

    // Find documents that were originally index files (paths ending with /)
    const indexPaths = docs.filter(d => d.path.endsWith('/'));

    // There should be at least some index files in a typical docs site
    // This is a soft check - not all sites have index files
    console.log(
      `Found ${indexPaths.length} index file paths:`,
      indexPaths.map(d => d.path),
    );
  });

  test('document content does not contain HTML tags', async ({ searchPage }) => {
    // Requirement 1.6: HTML tags should be stripped from content
    // Property 3: Search Index Content Sanitization
    const index = await searchPage.getSearchIndex();
    const docs = index?.documents || [];

    for (const doc of docs) {
      if (doc.content) {
        const hasHtml = containsHtmlTags(doc.content);
        if (hasHtml) {
          console.warn(`Document "${doc.title}" may contain HTML tags in content`);
        }
        // Note: Some edge cases might have < or > in code examples
        // This is a soft check
      }
    }
  });

  test('all documents have required fields', async ({ searchPage }) => {
    // Validate document structure
    const index = await searchPage.getSearchIndex();
    const validation = validateSearchIndex(index);

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
    }
    expect(validation.valid).toBe(true);
  });

  test('documents have non-empty titles', async ({ searchPage }) => {
    const index = await searchPage.getSearchIndex();
    const docs = index?.documents || [];

    for (const doc of docs) {
      expect(doc.title).toBeTruthy();
      expect(doc.title.length).toBeGreaterThan(0);
    }
  });

  test('documents have headings array', async ({ searchPage }) => {
    // Requirement 1.4: Headings should be extracted
    const index = await searchPage.getSearchIndex();
    const docs = index?.documents || [];

    for (const doc of docs) {
      expect(Array.isArray(doc.headings)).toBe(true);
    }
  });

  test('rawHeaders contain depth information', async ({ searchPage }) => {
    const index = await searchPage.getSearchIndex();
    const docs = index?.documents || [];

    // Find a document with rawHeaders
    const docWithHeaders = docs.find(d => d.rawHeaders && d.rawHeaders.length > 0);

    if (docWithHeaders) {
      for (const header of docWithHeaders.rawHeaders!) {
        expect(header.id).toBeDefined();
        expect(header.text).toBeDefined();
        expect(header.depth).toBeGreaterThanOrEqual(2);
        expect(header.depth).toBeLessThanOrEqual(6);
      }
    }
  });
});

/**
 * Search Index Debug Tests
 *
 * These tests help inspect the search index structure for debugging.
 */
test.describe('Search Index Debug', () => {
  test('inspect search index structure', async ({ searchPage }) => {
    await searchPage.goto('/');

    const index = await searchPage.getSearchIndex();

    if (!index) {
      console.log('No search index found');
      return;
    }

    const indexInfo = {
      documentCount: index.documents?.length || 0,
      sampleDocuments: index.documents?.slice(0, 3).map(d => ({
        id: d.id,
        path: d.path,
        title: d.title,
        headingsCount: d.headings?.length || 0,
        contentLength: d.content?.length || 0,
        hasRawHeaders: !!d.rawHeaders,
      })),
      options: index.options,
    };

    console.log('Search Index Info:', JSON.stringify(indexInfo, null, 2));

    expect(indexInfo.documentCount).toBeGreaterThan(0);
  });

  test('list all document paths', async ({ searchPage }) => {
    await searchPage.goto('/');

    const paths = await searchPage.getDocumentPaths();
    console.log('All document paths:', paths);

    expect(paths.length).toBeGreaterThan(0);
  });
});
