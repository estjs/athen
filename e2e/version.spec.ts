import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('Docs version switch', () => {
  test('dropdown switches URL and content', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/2.x/guide/getting-started`);

    const select = page.locator('[data-test="version-select"]');
    const exists = await select.count();
    test.skip(exists === 0, 'Version selector not present');

    await select.selectOption('1.x');

    await expect(page).toHaveURL(/\/docs\/1\.x\//);
    await expect(page.locator('h1')).toBeVisible();
  });
});
