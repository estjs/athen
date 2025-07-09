import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('http://localhost:4173');
  await expect(page).toHaveTitle(/Athen/);
});
