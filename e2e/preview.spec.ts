import { expect, test } from '@playwright/test';
import { SearchPage } from './helpers/search.helpers';

test.describe('production preview', () => {
  // TODO(product-bug): SSG output double/triple-escapes nested children (`&lt;a`, `&amp;amp;quot;`)
  // when rendering deeply nested components. Marked test.fail so it flips green when the SSR
  // serializer stops re-escaping already-escaped HTML.
  test.fail('serves prerendered HTML for locale home pages', async ({ page }) => {
    const response = await page.request.get('/');
    const html = await response.text();
    const ssgCssHref = html.match(/href="([^"]*\/assets\/ssrEntry-[^"]+\.css)"/)?.[1];
    const htmlWithoutScripts = html.replaceAll(/<script\b[\s\S]*?<\/script>/gi, '');

    expect(response.status()).toBe(200);
    expect(html).toMatch(/Documentation framework based on Vite &(.*)? Essor/);
    expect(html).not.toMatch(/<div id="app">\s*<\/div>/);
    expect(htmlWithoutScripts).not.toMatch(/&lt;(?:a|div|section|span)\b/);
    expect(htmlWithoutScripts).not.toContain('&amp;amp;');
    expect(ssgCssHref).toBeTruthy();

    const cssResponse = await page.request.get(ssgCssHref!);
    expect(cssResponse.status()).toBe(200);
    expect((await cssResponse.text()).trim().length).toBeGreaterThan(0);
  });

  test('serves the default home route from the built output', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#app')).not.toBeEmpty();
    await expect(page.getByRole('heading', { name: /athen/i, level: 1 })).toBeVisible();
  });

  test('uses the ssr-entry production bundle', async ({ page }) => {
    await page.goto('/');

    const scriptSrc = await page.locator('script[type="module"]').first().getAttribute('src');
    expect(scriptSrc).toMatch(/^\/assets\/ssrEntry-.+\.js$/);

    const response = await page.request.get(scriptSrc!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('javascript');
  });

  test('loads production CSS assets', async ({ page }) => {
    await page.goto('/');

    const stylesheetHrefs = await page
      .locator('link[rel="stylesheet"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute('href'))
          .filter((href): href is string => Boolean(href)),
      );
    expect(stylesheetHrefs).toEqual(
      expect.arrayContaining([expect.stringMatching(/^\/assets\/.+\.css$/)]),
    );

    for (const href of stylesheetHrefs) {
      const response = await page.request.get(href);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/css');
    }

    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveCSS('display', 'flex');
    await expect(nav).toHaveCSS('align-items', 'center');
    await expect(nav).toHaveCSS('justify-content', 'space-between');

    const navHeight = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--at-nav-height').trim(),
    );
    await expect(nav).toHaveCSS('height', navHeight);
  });

  test('hydrates built doc pages and keeps their styles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/guide/getting-started');

    await expect(page.getByRole('heading', { name: 'Quick Start', level: 1 })).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.aside')).toBeVisible();
    await expect(page.locator('.doc-layout')).toHaveCSS('display', 'grid');
  });

  test('loads the search index and returns results in preview', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto('/');

    await expect
      .poll(() => searchPage.getDocumentCount(), { message: 'search index document count' })
      .toBeGreaterThan(0);

    await searchPage.typeSearchQuery('Vite');
    await searchPage.waitForResultItems();
    await expect(searchPage.resultItems.first()).toBeVisible();
  });
});
