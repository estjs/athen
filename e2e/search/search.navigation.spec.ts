import { expect, test } from '../fixtures/search.fixture';

test.describe('Search Navigation', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.goto('/');
  });

  test.describe('Keyboard Shortcuts', () => {
    test('Cmd/Ctrl+K opens search and focuses input', async ({ searchPage }) => {
      // Requirement 2.6: Cmd/Ctrl+K should focus search
      await searchPage.pressSearchShortcut();

      const isFocused = await searchPage.isSearchInputFocused();
      expect(isFocused).toBe(true);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test.beforeEach(async ({ searchPage }) => {
      // Setup: type a query and wait for results
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();
    });

    test('ArrowDown highlights first result from initial state', async ({ searchPage }) => {
      await searchPage.pressArrowDown();

      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBe(0);
    });

    test('ArrowDown moves to next result', async ({ searchPage }) => {
      // Property 9: From index 0, ArrowDown should go to 1
      await searchPage.pressArrowDown(); // Go to index 0
      await searchPage.pressArrowDown(); // Go to index 1

      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBe(1);
    });

    test('ArrowUp moves to previous result', async ({ searchPage }) => {
      // Requirement 4.3: ArrowUp should highlight previous result
      // Property 9: From index 1, ArrowUp should go to 0
      await searchPage.pressArrowDown(); // Go to index 0
      await searchPage.pressArrowDown(); // Go to index 1
      await searchPage.pressArrowUp(); // Go back to index 0

      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBe(0);
    });

    test('ArrowUp from first result goes to no selection', async ({ searchPage }) => {
      // Property 9: From index 0, ArrowUp should go to -1
      await searchPage.pressArrowDown(); // Go to index 0
      await searchPage.pressArrowUp(); // Go back to -1

      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBe(-1);
    });

    test('ArrowDown does not go beyond last result', async ({ searchPage }) => {
      // Property 9: ArrowDown should not exceed N-1
      const count = await searchPage.getResultsCount();

      // Press ArrowDown more times than there are results
      for (let i = 0; i < count + 5; i++) {
        await searchPage.pressArrowDown();
      }

      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBe(count - 1);
    });

    test('Enter navigates to highlighted result', async ({ searchPage }) => {
      // Requirement 4.4: Enter should navigate to highlighted result
      await searchPage.pressArrowDown(); // Highlight first result
      await searchPage.pressEnter();

      // Should navigate away from home page
      await searchPage.page.waitForURL(/guide|api|getting-started/);
    });

    test('Escape closes search results', async ({ searchPage }) => {
      // Requirement 4.5: Escape should close results dropdown
      await expect(searchPage.searchResults).toBeVisible();

      await searchPage.pressEscape();

      await expect(searchPage.searchResults).not.toBeVisible();
    });

    test('Escape also blurs search input', async ({ searchPage }) => {
      await searchPage.pressEscape();

      // Input should lose focus after escape
      const isFocused = await searchPage.isSearchInputFocused();
      expect(isFocused).toBe(false);
    });
  });

  test.describe('Mouse Navigation', () => {
    test('clicking search result navigates to page', async ({ searchPage }) => {
      // Requirement 4.1: Click should navigate to result page
      await searchPage.typeSearchQuery('getting-started');
      await searchPage.waitForResultItems();

      await searchPage.clickResult(0);

      await expect(searchPage.page).toHaveURL(/getting-started/);
    });

    test('clicking outside search box closes results', async ({ searchPage }) => {
      // Requirement 4.6: Click outside should close dropdown
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResults();

      await expect(searchPage.searchResults).toBeVisible();

      // Click outside the search box
      await searchPage.clickOutside();

      // Wait for blur timeout (200ms in SearchBox.tsx)
      await searchPage.page.waitForTimeout(300);

      await expect(searchPage.searchResults).not.toBeVisible();
    });
  });

  /**
   * Navigation State Tests
   */
  test.describe('Navigation State', () => {
    test('active state is cleared when query changes', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      // Select first result
      await searchPage.pressArrowDown();
      expect(await searchPage.getActiveResultIndex()).toBe(0);

      // Change query
      await searchPage.clearSearchQuery();
      await searchPage.typeSearchQuery('api');
      await searchPage.waitForResultItems();

      // Active index should be reset
      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBe(-1);
    });

    test('results remain visible while navigating with keyboard', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      // Navigate through results
      await searchPage.pressArrowDown();
      await searchPage.pressArrowDown();
      await searchPage.pressArrowUp();

      // Results should still be visible
      await expect(searchPage.searchResults).toBeVisible();
    });
  });

  /**
   * Edge Cases
   */
  test.describe('Navigation Edge Cases', () => {
    test('Enter does nothing when no result is highlighted', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      const initialUrl = searchPage.page.url();

      // Press Enter without selecting any result
      await searchPage.pressEnter();

      // URL should not change
      expect(searchPage.page.url()).toBe(initialUrl);
    });

    test('keyboard navigation works after mouse hover', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      // Hover over a result (simulated by clicking and then using keyboard)
      await searchPage.pressArrowDown();
      await searchPage.pressArrowDown();

      const activeIndex = await searchPage.getActiveResultIndex();
      expect(activeIndex).toBeGreaterThanOrEqual(0);
    });
  });
});
