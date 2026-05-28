import { expect, test } from '@playwright/test';

/**
 * utility switching to zh and back to en routes
 */
async function switchLocale(page, locale: 'en' | 'zh') {
  // Translation dropdown is rendered only when multi-lang enabled
  await page.locator('button:has(.i-carbon-translate)').hover();
  await page.getByText(locale === 'en' ? 'English' : '简体中文', { exact: true }).click();
  if (locale === 'zh') {
    await expect(page).toHaveURL(/\/zh\//);
  } else {
    await expect(page).not.toHaveURL(/\/zh\//);
  }
}

test.describe('Athen docs E2E', () => {
  test('search box returns result and navigates', async ({ page }) => {
    await page.goto('/');
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
    await page.goto('/guide/getting-started');

    const sidebarLink = page.locator('.sidebar').locator('text=Assets handle');
    await sidebarLink.click();

    await expect(page).toHaveURL(/static-assets/);
    await expect(page.locator('h1')).toContainText(/Assets handle|静态资源/);
  });

  test('doc footer updates after sidebar navigation', async ({ page }) => {
    await page.goto('/guide/getting-started');

    await page.locator('.sidebar').getByRole('link', { name: 'Assets handle' }).click();

    await expect(page).toHaveURL(/\/guide\/static-assets$/);
    await expect(page.locator('.pager .prev')).toContainText('Using MDX');
    await expect(page.locator('.pager .prev a')).toHaveAttribute('href', '/guide/use-mdx');
    await expect(page.locator('.pager .next')).toContainText('Multi-Instance Sites');
    await expect(page.locator('.pager .next a')).toHaveAttribute('href', '/guide/multi-instance');
  });

  test('aside appears after client navigation from home to doc', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.getByRole('link', { name: 'Get Started' }).click();

    await expect(page).toHaveURL(/\/guide\/getting-started/);
    await expect(page.locator('.sidebar').getByRole('link', { name: 'Quick Start' })).toBeVisible();
    await expect(page.locator('.aside .toc-item').first()).toBeVisible();
    await expect(page.locator('.aside')).toContainText('Why Choose Athen?');
  });

  test('doc content width stays stable when aside is missing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/guide/getting-started');
    const withAsideWidth = await page.locator('.content').boundingBox();
    expect(withAsideWidth).not.toBeNull();

    await page.goto('/guide/search');
    const withoutAsideWidth = await page.locator('.content').boundingBox();
    expect(withoutAsideWidth).not.toBeNull();

    expect(Math.round(withoutAsideWidth!.width)).toBe(Math.round(withAsideWidth!.width));
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

  test('selected language is reused on the next visit', async ({ page }) => {
    await page.goto('/');
    await switchLocale(page, 'zh');

    await page.goto('/');

    await expect(page).toHaveURL(/\/zh\/?$/);
    await expect(page.getByRole('link', { name: '快速开始' })).toBeVisible();
  });

  test('language switch navigation', async ({ page }) => {
    await page.goto('/');
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
