import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

/**
 * Verify that navbar & sidebar items localize together when switching languages.
 */

test.describe('i18n synchronization', () => {
  test('navbar & sidebar reflect locale change', async ({ page }) => {
    await page.goto(BASE_URL);

    // capture english sidebar first item text
    const firstSidebarEn = (await page.locator('.sidebar a').first().textContent()) ?? '';
    const firstNavEn = (await page.locator('nav').locator('a').first().textContent()) ?? '';

    // Switch to Chinese
    await page.locator('button:has([data-icon="translator"])').click();
    await page.locator('text=中文').click();
    await expect(page).toHaveURL(/\/zh\//);

    const firstSidebarZh = await page.locator('.sidebar a').first();
    await expect(firstSidebarZh).not.toHaveText(firstSidebarEn);

    const firstNavZh = await page.locator('nav').locator('a').first();
    await expect(firstNavZh).not.toHaveText(firstNavEn);
  });
});
 