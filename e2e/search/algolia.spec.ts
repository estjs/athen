import { expect, test } from '@playwright/test';

/**
 * Algolia tests are all gated on the docs site shipping with a `#docsearch` mount.
 * On the default Athen docs (FlexSearch), these all auto-skip.
 */
async function isAlgoliaConfigured(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  return (await page.locator('#docsearch').count()) > 0;
}

test.describe('Algolia DocSearch integration', () => {
  test('scripts and CSS load when Algolia is configured', async ({ page }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    const hasDocSearchAssets = await page.evaluate(() => {
      const linksOrScripts = [
        ...document.querySelectorAll('link[rel="stylesheet"]'),
        ...document.querySelectorAll('script'),
      ];
      return linksOrScripts.some((el) =>
        (el.getAttribute('href') || el.getAttribute('src') || '').includes('docsearch'),
      );
    });
    expect(hasDocSearchAssets).toBe(true);
  });

  test('DocSearch button is rendered and enabled', async ({ page }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    const button = page.locator('#docsearch button').first();
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('clicking the DocSearch button opens the modal with an input', async ({
    page,
  }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    await page.locator('#docsearch button').first().click();
    await expect(page.locator('.DocSearch-Modal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.DocSearch-Input')).toBeVisible();
  });

  test('DocSearch modal returns hits for a known query', async ({ page }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    await page.locator('#docsearch button').first().click();
    await page.waitForSelector('.DocSearch-Modal', { timeout: 5000 });
    await page.fill('.DocSearch-Input', 'Quick Start');

    await expect(page.locator('.DocSearch-Hit').first()).toBeVisible({ timeout: 10_000 });
  });

  test('clicking a DocSearch hit navigates to the documentation page', async ({
    page,
  }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    await page.locator('#docsearch button').first().click();
    await page.waitForSelector('.DocSearch-Modal', { timeout: 5000 });
    await page.fill('.DocSearch-Input', 'Quick Start');

    const firstHit = page.locator('.DocSearch-Hit').first();
    await expect(firstHit).toBeVisible({ timeout: 10_000 });
    await firstHit.click();

    await expect(page).toHaveURL(/getting-started|quick-start/i);
  });

  test('Escape closes the DocSearch modal', async ({ page }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    await page.locator('#docsearch button').first().click();
    await page.waitForSelector('.DocSearch-Modal', { timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('.DocSearch-Modal')).not.toBeVisible();
  });

  test('search config reflects algolia provider when enabled', async ({ page }, testInfo) => {
    if (!(await isAlgoliaConfigured(page))) {
      testInfo.skip(true, 'Algolia DocSearch not configured in this build');
      return;
    }

    const config = await page.evaluate(() => (window as any).__ATHEN_SEARCH_CONFIG__);
    expect(config?.provider).toBe('algolia');
    expect(config?.algolia?.appId).toBeDefined();
    expect(config?.algolia?.apiKey).toBeDefined();
    expect(config?.algolia?.indexName).toBeDefined();
  });
});
