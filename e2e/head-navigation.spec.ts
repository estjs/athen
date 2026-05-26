import { expect, test } from '@playwright/test';

/**
 * Verifies the runtime head sync (`syncPageHead` in `runtime/head.ts`):
 *   - document.title and meta description must update on SPA navigation
 *   - the navigation must NOT trigger a full page reload (proves the reactive
 *     `effect` is doing the work, not the browser re-fetching the document)
 */

test.describe('runtime head sync on SPA navigation', () => {
  test('updates <title>, <html lang>, and meta description without reloading', async ({ page }) => {
    await page.goto('/');
    const initialTitle = await page.title();
    expect(initialTitle.length).toBeGreaterThan(0);

    // Set a sentinel on the live document so we can detect a full reload.
    await page.evaluate(() => {
      (window as unknown as { __athenSpaSentinel?: boolean }).__athenSpaSentinel = true;
    });

    // SPA-navigate to a different route. The Hero "Get Started" CTA is a real
    // anchor handled by essor-router — clicking it should not trigger a full
    // document fetch.
    await page.getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/guide\/getting-started$/);

    // Reactive head updates landed.
    await expect(page).toHaveTitle(/Quick Start/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description ?? '').not.toBe('');

    // Sentinel survives → no full reload happened.
    const sentinelSurvived = await page.evaluate(
      () => (window as unknown as { __athenSpaSentinel?: boolean }).__athenSpaSentinel === true,
    );
    expect(sentinelSurvived).toBe(true);
  });
});
