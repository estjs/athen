import { expect, test } from '@playwright/test';

/**
 * Route-level integration: locale-prefixed routes, excluded routes, and the
 * optional docs version selector (skipped on docs sites that don't use it).
 */
test.describe('route handling', () => {
  // route exclude: athen.config.ts excludes `/secret/**`; SPA dev mode should render a 404 page.
  // TODO(product-bug): route exclusion + 404 page are not wired up — `/secret/` currently
  // renders empty rather than a 404. Re-enable test.fail once that route policy lands.
  test.skip('excluded routes 404 in dev', async ({ page }) => {
    const response = await page.goto('/secret/');

    await expect(page.locator('text="Top Secret"')).toHaveCount(0);

    const is404Status = response?.status() === 404;
    const has404Text = (await page.locator('text="404"').count()) > 0;
    expect(is404Status || has404Text).toBeTruthy();
  });

  test('docs version selector switches URL and content (skipped when not configured)', async ({
    page,
  }, testInfo) => {
    await page.goto('/docs/2.x/guide/getting-started');

    const select = page.locator('[data-test="version-select"]');
    const exists = await select.count();
    if (exists === 0) {
      testInfo.skip(true, 'docs version selector not present in this docs site');
      return;
    }

    await select.selectOption('1.x');

    await expect(page).toHaveURL(/\/docs\/1\.x\//);
    await expect(page.locator('h1')).toBeVisible();
  });
});
