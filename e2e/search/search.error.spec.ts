import { expect, test } from '../fixtures/search.fixture';

test.describe('Search Error Handling', () => {
  test.describe('Search Index Errors', () => {
    test('search handles missing index gracefully', async ({ page }) => {
      // Requirement 9.1: Handle index load failure gracefully

      // Navigate to page and remove the search index
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Remove the search index from window
      await page.evaluate(() => {
        delete (window as any).__ATHEN_SEARCH_INDEX__;
      });

      // Try to search - should not crash
      const searchInput = page.locator('.search-input');
      await searchInput.click();
      await searchInput.fill('test');

      // Wait a bit for any errors to surface
      await page.waitForTimeout(500);

      // Page should still be functional (no crash)
      await expect(page.locator('.athen-search-box')).toBeVisible();
    });

    test('search handles empty index gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Set empty index
      await page.evaluate(() => {
        (window as any).__ATHEN_SEARCH_INDEX__ = {
          documents: [],
          options: {},
        };
      });

      // Try to search
      const searchInput = page.locator('.search-input');
      await searchInput.click();
      await searchInput.fill('test');

      // Should show no results (not crash)
      await page.waitForTimeout(500);

      // Should not crash - page should still be functional
      await expect(page.locator('.athen-search-box')).toBeVisible();
    });

    test('search handles malformed index gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Set malformed index
      await page.evaluate(() => {
        (window as any).__ATHEN_SEARCH_INDEX__ = {
          documents: 'not an array', // Invalid type
          options: null,
        };
      });

      // Try to search - should not crash
      const searchInput = page.locator('.search-input');
      await searchInput.click();
      await searchInput.fill('test');

      await page.waitForTimeout(500);

      // Page should still be functional
      await expect(page.locator('.athen-search-box')).toBeVisible();
    });
  });

  test.describe('Search Query Errors', () => {
    test('search handles special characters gracefully', async ({ searchPage }) => {
      // Requirement 9.2: Handle search errors gracefully
      await searchPage.goto('/');

      // Try searching with special characters that might cause regex errors
      const specialQueries = ['[]', '()', '.*', '\\', '+++', '???', '^^^', '$$$'];

      for (const query of specialQueries) {
        await searchPage.clearSearchQuery();
        await searchPage.typeSearchQuery(query);

        // Wait for search to complete
        await searchPage.page.waitForTimeout(300);

        // Should not crash - search box should still be visible
        await expect(searchPage.searchBox).toBeVisible();
      }
    });

    test('search handles very long queries gracefully', async ({ searchPage }) => {
      await searchPage.goto('/');

      // Create a very long query
      const longQuery = 'a'.repeat(1000);

      await searchPage.typeSearchQuery(longQuery);
      await searchPage.page.waitForTimeout(500);

      // Should not crash
      await expect(searchPage.searchBox).toBeVisible();
    });

    test('search handles unicode edge cases gracefully', async ({ searchPage }) => {
      await searchPage.goto('/');

      const unicodeQueries = [
        '🔍', // Emoji
        '𝕳𝖊𝖑𝖑𝖔', // Mathematical symbols
        '\u0000', // Null character
        '\uFFFD', // Replacement character
        '中文🎉English混合', // Mixed content
      ];

      for (const query of unicodeQueries) {
        await searchPage.clearSearchQuery();
        await searchPage.typeSearchQuery(query);

        await searchPage.page.waitForTimeout(300);

        // Should not crash
        await expect(searchPage.searchBox).toBeVisible();
      }
    });

    test('search handles rapid clear and type gracefully', async ({ searchPage }) => {
      await searchPage.goto('/');

      // Rapidly clear and type
      for (let i = 0; i < 10; i++) {
        await searchPage.typeSearchQuery('test');
        await searchPage.clearSearchQuery();
      }

      // Final search
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResults();

      // Should work normally
      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * UI Error Recovery Tests
   */
  test.describe('UI Error Recovery', () => {
    test('search recovers after error', async ({ searchPage }) => {
      await searchPage.goto('/');

      // Cause an error by searching with special chars
      await searchPage.typeSearchQuery('[]');
      await searchPage.page.waitForTimeout(300);

      // Clear and search normally
      await searchPage.clearSearchQuery();
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResults();

      // Should recover and show results
      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThan(0);
    });

    test('search box remains functional after multiple errors', async ({ searchPage }) => {
      await searchPage.goto('/');

      // Trigger multiple potential errors
      const errorQueries = ['[]', '()', '\\\\', '***'];

      for (const query of errorQueries) {
        await searchPage.clearSearchQuery();
        await searchPage.typeSearchQuery(query);
        await searchPage.page.waitForTimeout(200);
      }

      // Search box should still be functional
      await searchPage.clearSearchQuery();
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResults();

      const isVisible = await searchPage.isResultsVisible();
      expect(isVisible).toBe(true);
    });
  });

  /**
   * Console Error Monitoring
   */
  test.describe('Console Error Monitoring', () => {
    test('no console errors during normal search', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Perform normal search
      const searchInput = page.locator('.search-input');
      await searchInput.click();
      await searchInput.fill('guide');

      await page.waitForSelector('.search-results', { timeout: 5000 });

      // Filter out known non-critical errors
      const criticalErrors = consoleErrors.filter(
        err => !err.includes('favicon') && !err.includes('404') && !err.includes('net::ERR'),
      );

      // Should have no critical console errors
      expect(criticalErrors).toHaveLength(0);
    });
  });
});
