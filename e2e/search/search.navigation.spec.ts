import { expect, test } from '../fixtures/search.fixture';

function hrefPattern(href: string) {
  return new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

test.describe('Search Navigation', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.gotoLocale('en');
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

    test('ArrowDown selects first result for Enter navigation', async ({ searchPage }) => {
      const firstHref = await searchPage.resultItems.first().locator('.result-link').getAttribute('href');

      await searchPage.pressArrowDown();
      await searchPage.pressEnter();

      expect(firstHref).toBeTruthy();
      await expect(searchPage.page).toHaveURL(hrefPattern(firstHref!));
    });

    test('ArrowDown moves selection to next result for Enter navigation', async ({ searchPage }) => {
      // Property 9: From index 0, ArrowDown should go to 1
      const secondHref = await searchPage.resultItems.nth(1).locator('.result-link').getAttribute('href');

      await searchPage.pressArrowDown(); // Go to index 0
      await searchPage.pressArrowDown(); // Go to index 1
      await searchPage.pressEnter();

      expect(secondHref).toBeTruthy();
      await expect(searchPage.page).toHaveURL(hrefPattern(secondHref!));
    });

    test('ArrowUp moves selection to previous result for Enter navigation', async ({ searchPage }) => {
      // Requirement 4.3: ArrowUp should highlight previous result
      // Property 9: From index 1, ArrowUp should go to 0
      const firstHref = await searchPage.resultItems.first().locator('.result-link').getAttribute('href');

      await searchPage.pressArrowDown(); // Go to index 0
      await searchPage.pressArrowDown(); // Go to index 1
      await searchPage.pressArrowUp(); // Go back to index 0
      await searchPage.pressEnter();

      expect(firstHref).toBeTruthy();
      await expect(searchPage.page).toHaveURL(hrefPattern(firstHref!));
    });

    test('ArrowUp from first result clears Enter navigation selection', async ({ searchPage }) => {
      // Property 9: From index 0, ArrowUp should go to -1
      const initialUrl = searchPage.page.url();

      await searchPage.pressArrowDown(); // Go to index 0
      await searchPage.pressArrowUp(); // Go back to -1
      await searchPage.pressEnter();

      expect(searchPage.page.url()).toBe(initialUrl);
    });

    test('ArrowDown does not navigate beyond last result', async ({ searchPage }) => {
      // Property 9: ArrowDown should not exceed N-1
      const count = await searchPage.getResultsCount();
      const lastHref = await searchPage.resultItems.nth(count - 1).locator('.result-link').getAttribute('href');

      // Press ArrowDown more times than there are results
      for (let i = 0; i < count + 5; i++) {
        await searchPage.pressArrowDown();
      }
      await searchPage.pressEnter();

      expect(lastHref).toBeTruthy();
      await expect(searchPage.page).toHaveURL(hrefPattern(lastHref!));
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
      await searchPage.typeSearchQuery('Quick Start');
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
    test('keyboard selection is cleared when query changes', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      // Select first result
      await searchPage.pressArrowDown();

      // Change query
      await searchPage.clearSearchQuery();
      await searchPage.typeSearchQuery('api');
      await searchPage.waitForResultItems();
      const initialUrl = searchPage.page.url();

      // Selection should reset, so Enter should not navigate immediately.
      await searchPage.pressEnter();
      expect(searchPage.page.url()).toBe(initialUrl);
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

    test('keyboard navigation remains usable after mouse interaction', async ({ searchPage }) => {
      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();

      await searchPage.resultItems.first().hover();
      const secondHref = await searchPage.resultItems.nth(1).locator('.result-link').getAttribute('href');

      await searchPage.pressArrowDown();
      await searchPage.pressEnter();

      expect(secondHref).toBeTruthy();
      await expect(searchPage.page).toHaveURL(hrefPattern(secondHref!));
    });
  });
});
