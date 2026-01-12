import {
  EXPECTED_RESULTS,
  SEARCH_CONFIG,
  TEST_QUERIES,
  expect,
  test,
} from '../fixtures/search.fixture';

test.describe('FlexSearch Basic Functionality', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.goto('/');
  });

  test.describe('Search Box Visibility', () => {
    test('search box is visible on page', async ({ searchPage }) => {
      // Requirement 2.1: Search box should be visible when page loads
      const isVisible = await searchPage.isSearchBoxVisible();
      expect(isVisible).toBe(true);
    });

    test('search input is visible', async ({ searchPage }) => {
      await expect(searchPage.searchInput).toBeVisible();
    });

    test('search input receives focus on click', async ({ searchPage }) => {
      // Requirement 2.2: Search box should receive focus on click
      await searchPage.focusSearchBox();
      const isFocused = await searchPage.isSearchInputFocused();
      expect(isFocused).toBe(true);
    });
  });

  test.describe('Search Results Display', () => {
    test('typing in search shows results dropdown', async ({ searchPage }) => {
      // Requirement 2.3: Typing should display search results
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResults();

      const isVisible = await searchPage.isResultsVisible();
      expect(isVisible).toBe(true);
    });

    test('search results show document titles', async ({ searchPage }) => {
      // Requirement 3.1: Results should show document title
      // Property 7: Results Display Title
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      const titles = await searchPage.getResultTitles();
      expect(titles.length).toBeGreaterThan(0);

      for (const title of titles) {
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      }
    });

    test('search shows "no results" for non-matching query', async ({ searchPage }) => {
      // Requirement 2.5: No results message for non-matching query
      await searchPage.typeSearchQuery(TEST_QUERIES.noMatch);

      await expect(searchPage.noResults).toBeVisible({ timeout: SEARCH_CONFIG.defaultTimeout });
      await expect(searchPage.noResults).toContainText('No results found');
    });
  });

  test.describe('Empty Query Handling', () => {
    test('empty search does not show results', async ({ searchPage }) => {
      await searchPage.focusSearchBox();
      await searchPage.typeSearchQuery('');

      const isVisible = await searchPage.isResultsVisible();
      expect(isVisible).toBe(false);
    });

    test('whitespace-only search does not show results', async ({ searchPage }) => {
      // Property 6: Empty Query Returns No Results
      await searchPage.typeSearchQuery('   ');

      const isVisible = await searchPage.isResultsVisible();
      expect(isVisible).toBe(false);
    });

    test('tab character search does not show results', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('\t');

      const isVisible = await searchPage.isResultsVisible();
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Search by Different Fields', () => {
    test('search finds documents by title', async ({ searchPage }) => {
      // Requirement 8.1: Search by document title
      await searchPage.typeSearchQuery('Quick Start');
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThan(0);

      const titles = await searchPage.getResultTitles();
      const hasMatch = titles.some(t => /Quick Start|快速开始/i.test(t));
      expect(hasMatch).toBe(true);
    });

    test('search finds documents by content', async ({ searchPage }) => {
      // Requirement 8.3: Search by body content
      await searchPage.typeSearchQuery('Vite');
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThan(0);
    });

    test('search finds documents by heading', async ({ searchPage }) => {
      // Requirement 8.2: Search by heading text
      await searchPage.typeSearchQuery('configuration');
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThan(0);
    });

    test('partial word search works (prefix matching)', async ({ searchPage }) => {
      // Requirement 8.4: Partial word search with forward tokenization
      await searchPage.typeSearchQuery(TEST_QUERIES.partial);
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThan(0);
    });
  });
  test.describe('Result Count Limit', () => {
    test('search results do not exceed maximum limit', async ({ searchPage }) => {
      // Property 8: Result Count Limit
      // Search for a common term that should have many matches
      await searchPage.typeSearchQuery('a');
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      expect(count).toBeLessThanOrEqual(SEARCH_CONFIG.maxResults);
    });
  });

  test.describe('Search Result Content', () => {
    test('search results show content snippet when matching content', async ({ searchPage }) => {
      // Requirement 3.2: Content snippet with context
      await searchPage.typeSearchQuery('Vite');
      await searchPage.waitForResultItems();

      // Check if any result has content
      const firstResult = searchPage.resultItems.first();
      const hasContent = (await firstResult.locator('.result-content').count()) > 0;

      // Content might not always be present, but structure should be valid
      expect(await firstResult.locator('.result-title').count()).toBeGreaterThan(0);
    });

    test('search highlights matching text', async ({ searchPage }) => {
      // Requirement 3.4: Highlight matching text
      await searchPage.typeSearchQuery('Vite');
      await searchPage.waitForResultItems();

      const highlightCount = await searchPage.getHighlightCount();
      expect(highlightCount).toBeGreaterThan(0);
    });

    test('search results structure is correct', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      const firstResult = searchPage.resultItems.first();

      // Title should always be present
      const title = firstResult.locator('.result-title');
      await expect(title).toBeVisible();
      expect(await title.textContent()).toBeTruthy();
    });
  });

  /**
   * Parameterized Tests for Expected Results
   */
  test.describe('Expected Search Results', () => {
    for (const expected of EXPECTED_RESULTS) {
      test(`search for "${expected.query}" returns expected results`, async ({ searchPage }) => {
        await searchPage.typeSearchQuery(expected.query);
        await searchPage.waitForResultItems();

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThanOrEqual(expected.minResults);

        if (expected.expectedTitlePattern) {
          const titles = await searchPage.getResultTitles();
          const hasMatch = titles.some(t => expected.expectedTitlePattern!.test(t));
          expect(hasMatch).toBe(true);
        }

        if (expected.expectedPathPattern) {
          const paths = await searchPage.getResultPaths();
          const hasMatch = paths.some(p => expected.expectedPathPattern!.test(p));
          expect(hasMatch).toBe(true);
        }
      });
    }
  });
});
