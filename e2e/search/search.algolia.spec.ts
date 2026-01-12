import { expect, test } from '@playwright/test';

test.describe('Algolia Search Integration', () => {
  /**
   * Check if Algolia is enabled before running tests
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Algolia Configuration', () => {
    test('gracefully skip when Algolia is not configured', async ({ page }) => {
      // Requirement 7.4: Gracefully skip when not configured
      const hasDocSearch = await page.locator('#docsearch').count();

      if (hasDocSearch === 0) {
        console.log('Algolia DocSearch not configured - skipping Algolia tests');
        test.skip();
      }

      expect(hasDocSearch).toBeGreaterThanOrEqual(0);
    });

    test('Algolia scripts are injected when configured', async ({ page }) => {
      // Requirement 7.1: Algolia scripts should be injected
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      // Check for DocSearch CSS
      const hasDocSearchCss = await page.evaluate(() => {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        return Array.from(links).some(link => link.getAttribute('href')?.includes('docsearch'));
      });

      // Check for DocSearch script
      const hasDocSearchScript = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        return Array.from(scripts).some(script =>
          script.getAttribute('src')?.includes('docsearch'),
        );
      });

      expect(hasDocSearchCss || hasDocSearchScript).toBe(true);
    });
  });

  test.describe('Algolia UI', () => {
    test('DocSearch container is displayed when enabled', async ({ page }) => {
      // Requirement 7.2: DocSearch container should be displayed
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      const docSearchContainer = page.locator('#docsearch');
      await expect(docSearchContainer).toBeVisible();
    });

    test('DocSearch button is clickable', async ({ page }) => {
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      const docSearchButton = page.locator('#docsearch button').first();
      await expect(docSearchButton).toBeVisible();
      await expect(docSearchButton).toBeEnabled();
    });
  });

  test.describe('Algolia Search Functionality', () => {
    test('DocSearch opens and shows search input', async ({ page }) => {
      // Requirement 7.3: Algolia search should work
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      // Click to open DocSearch modal
      await page.locator('#docsearch button').first().click();

      // DocSearch modal should appear
      const modal = page.locator('.DocSearch-Modal');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Search input should be visible
      const searchInput = page.locator('.DocSearch-Input');
      await expect(searchInput).toBeVisible();
    });

    test('DocSearch returns results for valid query', async ({ page }) => {
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      // Open DocSearch
      await page.locator('#docsearch button').first().click();

      // Wait for modal
      await page.waitForSelector('.DocSearch-Modal', { timeout: 5000 });

      // Type search query
      await page.fill('.DocSearch-Input', 'Quick Start');

      // Wait for results
      const hits = page.locator('.DocSearch-Hit');
      await expect(hits.first()).toBeVisible({ timeout: 10000 });
    });

    test('clicking DocSearch result navigates to page', async ({ page }) => {
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      // Open DocSearch
      await page.locator('#docsearch button').first().click();
      await page.waitForSelector('.DocSearch-Modal', { timeout: 5000 });

      // Search
      await page.fill('.DocSearch-Input', 'Quick Start');

      // Wait for and click first result
      const firstHit = page.locator('.DocSearch-Hit').first();
      await expect(firstHit).toBeVisible({ timeout: 10000 });
      await firstHit.click();

      // Should navigate to a page
      await expect(page).toHaveURL(/getting-started|quick-start/i);
    });

    test('DocSearch keyboard shortcut works', async ({ page }) => {
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      // Press / to open DocSearch (common shortcut)
      await page.keyboard.press('/');

      // Modal should open
      const modal = page.locator('.DocSearch-Modal');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });

    test('Escape closes DocSearch modal', async ({ page }) => {
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      // Open DocSearch
      await page.locator('#docsearch button').first().click();
      await page.waitForSelector('.DocSearch-Modal', { timeout: 5000 });

      // Press Escape
      await page.keyboard.press('Escape');

      // Modal should close
      const modal = page.locator('.DocSearch-Modal');
      await expect(modal).not.toBeVisible();
    });
  });

  /**
   * Algolia Config Validation
   */
  test.describe('Algolia Config Validation', () => {
    test('search config indicates algolia provider when enabled', async ({ page }) => {
      const hasDocSearch = await page.locator('#docsearch').count();

      test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

      const config = await page.evaluate(() => {
        return (window as any).__ATHEN_SEARCH_CONFIG__;
      });

      expect(config).toBeDefined();
      expect(config.provider).toBe('algolia');
      expect(config.algolia).toBeDefined();
      expect(config.algolia.appId).toBeDefined();
      expect(config.algolia.apiKey).toBeDefined();
      expect(config.algolia.indexName).toBeDefined();
    });
  });
});
