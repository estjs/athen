import { expect, test } from '@playwright/test';

/**
 * utility switching to zh and back to en routes
 */
async function switchLocale(page, locale: 'en' | 'zh') {
  // Translation dropdown is rendered only when multi-lang enabled
  await page.locator('button:has(.i-carbon-translate)').hover();
  await page.getByText(locale === 'en' ? 'English' : '简体中文', { exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/`));
}

test.describe('Athen docs E2E', () => {
  test('search box returns result and navigates', async ({ page }) => {
    await page.goto('/en/');
    await page.keyboard.press('/'); // Focus search input via shortcut
    await page.getByPlaceholder('Search...').fill('Quick Start');

    // Expect suggestion list to appear
    const firstResult = page.locator('.search-results .result-item').first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();

    // Should navigate to getting-started page
    await expect(page).toHaveURL(/getting-started/);
    await expect(page.locator('h1')).toContainText('Quick Start');
  });

  test('sidebar navigation changes article', async ({ page }) => {
    await page.goto('/en/guide/getting-started');

    const sidebarLink = page.locator('.sidebar').locator('text=Static Assets');
    await sidebarLink.click();

    await expect(page).toHaveURL(/static-assets/);
    await expect(page.locator('h1')).toContainText(/Assets handle|静态资源/);
  });

  test('doc footer updates after sidebar navigation', async ({ page }) => {
    await page.goto('/en/guide/getting-started');

    await page.locator('.sidebar').getByRole('link', { name: 'Static Assets' }).click();

    await expect(page).toHaveURL(/\/en\/guide\/static-assets$/);
    await expect(page.locator('.pager .prev')).toContainText('Using MDX');
    await expect(page.locator('.pager .prev a')).toHaveAttribute('href', '/en/guide/use-mdx');
    await expect(page.locator('.pager .next')).toContainText('Multi-Instance Sites');
    await expect(page.locator('.pager .next a')).toHaveAttribute('href', '/en/guide/multi-instance');
  });

  test('aside appears after client navigation from home to doc', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/');

    await page.getByRole('link', { name: 'Get Started' }).click();

    await expect(page).toHaveURL(/\/en\/guide\/getting-started/);
    await expect(page.locator('.sidebar').getByRole('link', { name: 'Getting Started' })).toBeVisible();
    await expect(page.locator('.aside .toc-item').first()).toBeVisible();
    await expect(page.locator('.aside')).toContainText('Why Choose Athen?');
  });

  test('dark mode toggle persists after reload', async ({ page }) => {
    await page.goto('/');
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
    await page.goto('/en/');
    // Ensure we are on english homepage
    await expect(page.locator('h1')).toContainText('athen');
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();

    await switchLocale(page, 'zh');
    await expect(page.locator('h1')).toContainText('athen');
    await expect(page.getByRole('link', { name: '快速开始' })).toBeVisible();

    await switchLocale(page, 'en');
    await expect(page.locator('h1')).toContainText('athen');
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });
});
