import { expect, test } from '@playwright/test';

/**
 * Verifies `syncPageHead` in `runtime/head.ts`: <title>, <html lang>, and meta
 * description update on SPA navigation without a full document reload.
 */
test.describe('runtime head sync on SPA navigation', () => {
  test('updates <title>, <html lang>, and meta description without reloading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    const initialTitle = await page.title();
    expect(initialTitle.length).toBeGreaterThan(0);

    // Sentinel survives only if no full reload happens.
    await page.evaluate(() => {
      (window as unknown as { __athenSpaSentinel?: boolean }).__athenSpaSentinel = true;
    });

    await page.getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/guide\/getting-started$/);

    await expect(page).toHaveTitle(/Quick Start/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description ?? '').not.toBe('');

    const sentinelSurvived = await page.evaluate(
      () => (window as unknown as { __athenSpaSentinel?: boolean }).__athenSpaSentinel === true,
    );
    expect(sentinelSurvived).toBe(true);
  });
});
