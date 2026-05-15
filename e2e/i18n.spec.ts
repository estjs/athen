import { expect, test } from '@playwright/test';

/**
 * Verify that navbar & sidebar items localize together when switching languages.
 */

test.describe('i18n synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  async function switchLanguage(page, label: string) {
    await page.locator('button:has(.i-carbon-translate)').hover();
    await page.getByText(label, { exact: true }).click();
  }

  test('switching from English doc to Chinese keeps the current doc path and updates chrome', async ({
    page,
  }) => {
    await page.goto('/guide/getting-started');

    await switchLanguage(page, '简体中文');

    await expect(page).toHaveURL(/\/zh\/guide\/getting-started$/);
    await expect(page.getByRole('heading', { name: '快速开始', level: 1 })).toBeVisible();
    await expect(page.locator('.nav').getByRole('link', { name: '指南' })).toBeVisible();
    await expect(page.locator('.sidebar').getByRole('link', { name: '快速开始' })).toBeVisible();
    await expect(page.locator('.aside')).toContainText('为什么选择 Athen?');
  });

  test('switching from Chinese doc to English keeps the current doc path and updates chrome', async ({
    page,
  }) => {
    await page.goto('/zh/guide/getting-started');

    await switchLanguage(page, 'English');

    await expect(page).toHaveURL(/\/guide\/getting-started$/);
    await expect(page.getByRole('heading', { name: 'Quick Start', level: 1 })).toBeVisible();
    await expect(page.locator('.nav').getByRole('link', { name: 'Guide' })).toBeVisible();
    await expect(
      page.locator('.sidebar').getByRole('link', { name: 'Getting Started' }),
    ).toBeVisible();
    await expect(page.locator('.aside')).toContainText('Why Choose Athen?');
  });

  test('switching after client navigation keeps the current doc path and updates chrome', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/guide\/getting-started$/);

    await switchLanguage(page, '简体中文');

    await expect(page).toHaveURL(/\/zh\/guide\/getting-started$/);
    await expect(page.getByRole('heading', { name: '快速开始', level: 1 })).toBeVisible();
    await expect(page.locator('.nav').getByRole('link', { name: '指南' })).toBeVisible();
    await expect(page.locator('.sidebar').getByRole('link', { name: '快速开始' })).toBeVisible();
    await expect(page.locator('.aside')).toContainText('为什么选择 Athen?');
  });

  test('doc footer prev and next stay within the current sidebar section', async ({ page }) => {
    await page.goto('/api/config-basic');

    await expect(page.locator('.pager .prev')).toBeEmpty();
    await expect(page.locator('.pager .next')).toContainText('Theme Config');
    await expect(page.locator('.pager .next a')).toHaveAttribute('href', '/api/config-theme');
  });
});
