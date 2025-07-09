import { expect, test } from '@playwright/test';

// Base URL points to the preview server started by Playwright webServer config
const BASE_URL = 'http://localhost:4173';

/**
 * utility switching to zh and back to en routes
 */
async function switchLocale(page, locale: 'en' | 'zh') {
  // Translation dropdown is rendered only when multi-lang enabled
  await page.locator('button:has([data-icon="translator"])').click();
  await page.locator(`text=${locale === 'en' ? 'English' : '中文'}`).click();
  await expect(page).toHaveURL(new RegExp(`/${locale === 'en' ? '' : 'zh/'}`));
}

test.describe('Athen docs E2E', () => {
  test('search box returns result and navigates', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.keyboard.press('/'); // Focus search input via shortcut
    await page.fill('input[placeholder="Search"]', 'Quick Start');

    // Expect suggestion list to appear
    const firstResult = page.locator('.athen-search-result-item').first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();

    // Should navigate to getting-started page
    await expect(page).toHaveURL(/getting-started/);
    await expect(page.locator('h1')).toContainText('Quick Start');
  });

  test('sidebar navigation changes article', async ({ page }) => {
    await page.goto(`${BASE_URL}/guide/getting-started`);

    const sidebarLink = page.locator('.sidebar').locator('text=Static Assets');
    await sidebarLink.click();

    await expect(page).toHaveURL(/static-assets/);
    await expect(page.locator('h1')).toContainText(/Assets handle|静态资源/);
  });

  test('dark mode toggle persists after reload', async ({ page }) => {
    await page.goto(BASE_URL);
    const html = page.locator('html');
    const toggle = page.locator('button[role="switch"]');

    // ensure initial state is light
    await expect(html).not.toHaveClass(/dark/);

    // toggle to dark mode
    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    // reload the page; preference should persist via localStorage
    await page.reload();
    await expect(html).toHaveClass(/dark/);

    // toggle back to light and verify persistence again
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('language switch navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    // Ensure we are on english homepage
    await expect(page.locator('h1')).toContainText('Quick Start');

    await switchLocale(page, 'zh');
    await expect(page.locator('h1')).toContainText('快速开始');

    await switchLocale(page, 'en');
    await expect(page.locator('h1')).toContainText('Quick Start');
  });
});
