import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

/**
 * This test expects the docs site to be built with search.provider="algolia".
 * If Algolia docsearch container is missing, the test will be skipped automatically.
 */

test.describe('Algolia search integration', () => {
  test('docsearch opens and navigates from result', async ({ page }) => {
    await page.goto(BASE_URL);

    // Skip gracefully if docsearch container not injected (provider not enabled)
    const hasDocSearch = await page.locator('#docsearch').count();
    test.skip(hasDocSearch === 0, 'Algolia provider not enabled in this build');

    // Focus input via shortcut
    await page.keyboard.press('/');
    await page.fill('#docsearch input', 'Quick Start');

    const firstHit = page.locator('.DocSearch-Hit').first();
    await expect(firstHit).toBeVisible();
    await firstHit.click();

    // Expect navigation happened
    await expect(page).toHaveURL(/getting-started/);
  });
});
