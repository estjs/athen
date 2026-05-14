import { expect, test } from '@playwright/test';

test.skip('excluded route should not be accessible', async ({ page }) => {
  // Try to visit the secret page that we excluded in athen.config.ts
  const response = await page.goto('/secret/');

  // Depending on whether it's production (404 status from Sirv/Polka)
  // or dev mode (client-side router handles 404), we check both scenarios.

  // 1. The text of the secret page MUST NOT be visible
  await expect(page.locator('text="Top Secret"')).toHaveCount(0);

  // 2. Either the status is 404, or the client router shows a 404 page
  // In dev server with essor-router, unhandled routes usually render an empty or 404 layout
  const is404Status = response?.status() === 404;
  const has404Text = (await page.locator('text="404"').count()) > 0;

  expect(is404Status || has404Text).toBeTruthy();
});
