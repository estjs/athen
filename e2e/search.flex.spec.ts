import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('FlexSearch integration', () => {
  test('suggestion list appears and navigates', async ({ page }) => {
    await page.goto(BASE_URL);

    // Skip if Algolia docsearch is enabled (avoid duplicate coverage)
    const hasDocSearch = await page.locator('#docsearch').count();
    test.skip(hasDocSearch > 0, 'Algolia provider overrides FlexSearch');

    // Trigger search
    await page.keyboard.press('/');
    await page.fill('input[placeholder="Search"]', 'Quick Start');

    const firstResult = page.locator('.athen-search-result-item').first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();

    await expect(page).toHaveURL(/getting-started/);
    await expect(page.locator('h1')).toContainText(/Quick Start|快速开始/);
  });
});
