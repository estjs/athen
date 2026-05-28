import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('loads with the documented title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Athen/);
    await expect(page.getByRole('heading', { name: /athen/i, level: 1 })).toBeVisible();
  });
});
