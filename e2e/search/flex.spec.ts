import {
  EXPECTED_RESULTS,
  SEARCH_CONFIG,
  TEST_QUERIES,
  expect,
  test,
} from '../fixtures/search.fixture';
import { containsHtmlTags, validateSearchIndex } from '../helpers/search.helpers';

test.describe('FlexSearch', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.gotoLocale('en');
  });

  test.describe('search box visibility', () => {
    test('search box and input are visible on page', async ({ searchPage }) => {
      expect(await searchPage.isSearchBoxVisible()).toBe(true);
      await expect(searchPage.searchInput).toBeVisible();
    });

    test('input receives focus on click', async ({ searchPage }) => {
      await searchPage.focusSearchBox();
      expect(await searchPage.isSearchInputFocused()).toBe(true);
    });
  });

  test.describe('results display', () => {
    test('typing in search shows the results dropdown', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResults();
      expect(await searchPage.isResultsVisible()).toBe(true);
    });

    test('result items show non-empty document titles', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      const titles = await searchPage.getResultTitles();
      expect(titles.length).toBeGreaterThan(0);
      for (const title of titles) {
        expect(title).toBeTruthy();
      }
    });

    test('shows "no results" message for a non-matching query', async ({ searchPage }) => {
      await searchPage.typeSearchQuery(TEST_QUERIES.noMatch);
      await expect(searchPage.noResults).toBeVisible({ timeout: SEARCH_CONFIG.defaultTimeout });
      await expect(searchPage.noResults).toContainText('No results found');
    });
  });

  test.describe('empty / whitespace queries', () => {
    test('empty search does not show results', async ({ searchPage }) => {
      await searchPage.focusSearchBox();
      await searchPage.typeSearchQuery('');
      expect(await searchPage.isResultsVisible()).toBe(false);
    });

    test('whitespace-only / tab queries do not show results', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('   ');
      await expect(searchPage.resultItems).toHaveCount(0);

      await searchPage.clearSearchQuery();
      await searchPage.typeSearchQuery('\t');
      await expect(searchPage.resultItems).toHaveCount(0);
    });
  });

  test.describe('search across title, content, headings', () => {
    test('finds documents by title', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('Quick Start');
      await searchPage.waitForResultItems();

      const titles = await searchPage.getResultTitles();
      expect(titles.some((t) => /Quick Start|快速开始/i.test(t))).toBe(true);
    });

    test('finds documents by body content', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('Vite');
      await searchPage.waitForResultItems();
      expect(await searchPage.getResultsCount()).toBeGreaterThan(0);
    });

    test('finds documents by heading text', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('configuration');
      await searchPage.waitForResultItems();
      expect(await searchPage.getResultsCount()).toBeGreaterThan(0);
    });

    test('forward tokenization matches prefixes', async ({ searchPage }) => {
      await searchPage.typeSearchQuery(TEST_QUERIES.partial);
      await searchPage.waitForResultItems();
      expect(await searchPage.getResultsCount()).toBeGreaterThan(0);
    });
  });

  test('result count is capped at SEARCH_CONFIG.maxResults', async ({ searchPage }) => {
    await searchPage.typeSearchQuery('a');
    await searchPage.waitForResultItems();
    expect(await searchPage.getResultsCount()).toBeLessThanOrEqual(SEARCH_CONFIG.maxResults);
  });

  test('result items contain a title node and highlight matching text', async ({ searchPage }) => {
    await searchPage.typeSearchQuery('Vite');
    await searchPage.waitForResultItems();

    const firstResult = searchPage.resultItems.first();
    await expect(firstResult.locator('.result-title')).toBeVisible();
    expect(await searchPage.getHighlightCount()).toBeGreaterThan(0);
  });

  test.describe('expected results matrix', () => {
    for (const expected of EXPECTED_RESULTS) {
      test(`"${expected.query}" returns at least ${expected.minResults} result(s)`, async ({
        searchPage,
      }) => {
        if (/[一-鿌]/.test(expected.query)) {
          await searchPage.gotoLocale('zh');
        }

        await searchPage.typeSearchQuery(expected.query);
        await searchPage.waitForResultItems();

        expect(await searchPage.getResultsCount()).toBeGreaterThanOrEqual(expected.minResults);

        if (expected.expectedTitlePattern) {
          const titles = await searchPage.getResultTitles();
          expect(titles.some((t) => expected.expectedTitlePattern!.test(t))).toBe(true);
        }

        if (expected.expectedPathPattern) {
          const paths = await searchPage.getResultPaths();
          expect(paths.some((p) => expected.expectedPathPattern!.test(p))).toBe(true);
        }
      });
    }
  });
});

test.describe('FlexSearch index', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.goto('/');
  });

  test('index is loaded and contains documents', async ({ searchPage }) => {
    expect(await searchPage.isSearchIndexLoaded()).toBe(true);
    expect(await searchPage.getDocumentCount()).toBeGreaterThan(0);
  });

  test('index conforms to the documents+options JSON shape', async ({ searchPage }) => {
    const index = await searchPage.getSearchIndex();
    expect(index).not.toBeNull();
    expect(Array.isArray(index?.documents)).toBe(true);
    expect(typeof index?.options).toBe('object');
  });

  test('all paths start with `/` and have no markdown extension', async ({ searchPage }) => {
    const paths = await searchPage.getDocumentPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).toMatch(/^\//);
      expect(path).not.toMatch(/\.(md|mdx)$/);
    }
  });

  test('content does not contain html tags (soft warn for code-block edge cases)', async ({
    searchPage,
  }) => {
    const index = await searchPage.getSearchIndex();
    for (const doc of index?.documents || []) {
      if (doc.content && containsHtmlTags(doc.content)) {
        console.warn(`document "${doc.title}" content may still contain html`);
      }
    }
  });

  test('document structure validates per validateSearchIndex', async ({ searchPage }) => {
    const validation = validateSearchIndex(await searchPage.getSearchIndex());
    if (!validation.valid) console.error('validation errors:', validation.errors);
    expect(validation.valid).toBe(true);
  });

  test('rawHeaders carry depth between 2-6', async ({ searchPage }) => {
    const index = await searchPage.getSearchIndex();
    const sample = (index?.documents || []).find((d) => d.rawHeaders && d.rawHeaders.length > 0);
    if (!sample) return;
    for (const header of sample.rawHeaders!) {
      expect(header.id).toBeDefined();
      expect(header.text).toBeDefined();
      expect(header.depth).toBeGreaterThanOrEqual(2);
      expect(header.depth).toBeLessThanOrEqual(6);
    }
  });
});
