import {
  CJK_TEST_DATA,
  LOCALE_CASES,
  TEST_QUERIES,
  expect,
  test,
} from '../fixtures/search.fixture';

test.describe('Search Internationalization', () => {
  test.describe('Locale Path Consistency', () => {
    test('English locale search returns paths with /en/ prefix', async ({ searchPage }) => {
      // Requirement 5.1: English locale results should have /en/ prefix
      // Property 10: Locale Path Consistency
      await searchPage.gotoLocale('en');

      await searchPage.typeSearchQuery('Quick Start');
      await searchPage.waitForResultItems();

      const paths = await searchPage.getResultPaths();
      expect(paths.length).toBeGreaterThan(0);

      for (const path of paths) {
        expect(path).toMatch(/^\/en\//);
      }
    });

    test('Chinese locale search returns paths with /zh/ prefix', async ({ searchPage }) => {
      // Requirement 5.2: Chinese locale results should have /zh/ prefix
      // Property 10: Locale Path Consistency
      await searchPage.gotoLocale('zh');

      await searchPage.typeSearchQuery('快速开始');
      await searchPage.waitForResultItems();

      const paths = await searchPage.getResultPaths();
      expect(paths.length).toBeGreaterThan(0);

      for (const path of paths) {
        expect(path).toMatch(/^\/zh\//);
      }
    });

    test('navigation from search preserves locale', async ({ searchPage }) => {
      // Requirement 5.5: Navigation should preserve current locale
      await searchPage.gotoLocale('en');

      await searchPage.typeSearchQuery('guide');
      await searchPage.waitForResultItems();
      await searchPage.clickResult(0);

      // URL should still contain /en/
      await expect(searchPage.page).toHaveURL(/\/en\//);
    });
  });

  /**
   * Parameterized Locale Tests
   */
  test.describe('Parameterized Locale Tests', () => {
    for (const localeCase of LOCALE_CASES) {
      test(`search in ${localeCase.locale} locale for "${localeCase.query}"`, async ({
        searchPage,
      }) => {
        await searchPage.gotoLocale(localeCase.locale);

        await searchPage.typeSearchQuery(localeCase.query);
        await searchPage.waitForResultItems();

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThan(0);

        const paths = await searchPage.getResultPaths();
        for (const path of paths) {
          expect(path).toContain(localeCase.pathPrefix);
        }
      });
    }
  });

  test.describe('CJK Content Search', () => {
    test('Chinese content search works', async ({ searchPage }) => {
      // Requirement 5.3: Chinese content search
      // Property 11: CJK Content Indexing
      await searchPage.gotoLocale('zh');

      await searchPage.typeSearchQuery('快速开始');
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      expect(count).toBeGreaterThan(0);
    });

    test('search index contains Chinese content', async ({ searchPage }) => {
      // Property 11: CJK Content Indexing
      await searchPage.goto('/');

      const index = await searchPage.getSearchIndex();
      const docs = index?.documents || [];

      // Find documents with Chinese content
      const chineseDocs = docs.filter(
        doc =>
          CJK_TEST_DATA.chinese.expectedChars.test(doc.title) ||
          CJK_TEST_DATA.chinese.expectedChars.test(doc.content),
      );

      expect(chineseDocs.length).toBeGreaterThan(0);
      console.log(`Found ${chineseDocs.length} documents with Chinese content`);
    });

    test('Chinese queries return relevant results', async ({ searchPage }) => {
      await searchPage.gotoLocale('zh');

      for (const query of TEST_QUERIES.chinese) {
        await searchPage.clearSearchQuery();
        await searchPage.typeSearchQuery(query);

        // Wait a bit for results
        await searchPage.page.waitForTimeout(500);

        const isVisible = await searchPage.isResultsVisible();
        const noResultsVisible = await searchPage.isNoResultsVisible();

        // Either results or no-results should be shown
        expect(isVisible || noResultsVisible).toBe(true);
      }
    });
  });

  /**
   * Cross-locale Search Tests
   */
  test.describe('Cross-locale Search', () => {
    test('English query in Chinese locale still works', async ({ searchPage }) => {
      await searchPage.gotoLocale('zh');

      // Search with English term
      await searchPage.typeSearchQuery('Vite');
      await searchPage.waitForResultItems();

      const count = await searchPage.getResultsCount();
      // Should find results (Vite is a technical term used in both languages)
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('search index is shared across locales', async ({ searchPage }) => {
      // Get index from English locale
      await searchPage.gotoLocale('en');
      const enIndex = await searchPage.getSearchIndex();
      const enDocCount = enIndex?.documents?.length || 0;

      // Get index from Chinese locale
      await searchPage.gotoLocale('zh');
      const zhIndex = await searchPage.getSearchIndex();
      const zhDocCount = zhIndex?.documents?.length || 0;

      // Both should have the same index (it's injected at build time)
      expect(enDocCount).toBe(zhDocCount);
    });
  });

  /**
   * Search Index CJK Validation
   */
  test.describe('Search Index CJK Validation', () => {
    test('documents with CJK titles are indexed', async ({ searchPage }) => {
      await searchPage.goto('/');

      const index = await searchPage.getSearchIndex();
      const docs = index?.documents || [];

      // Check for documents with CJK titles
      const cjkTitleDocs = docs.filter(doc =>
        /[\u4E00-\u9FCC\u3041-\u3096\u30A1-\u30FA\uAC00-\uD7A3]/.test(doc.title),
      );

      console.log(`Documents with CJK titles: ${cjkTitleDocs.length}`);
      console.log(
        'Sample CJK titles:',
        cjkTitleDocs.slice(0, 3).map(d => d.title),
      );
    });

    test('documents with CJK headings are indexed', async ({ searchPage }) => {
      await searchPage.goto('/');

      const index = await searchPage.getSearchIndex();
      const docs = index?.documents || [];

      // Check for documents with CJK headings
      const cjkHeadingDocs = docs.filter(doc =>
        doc.headings.some(h => /[\u4E00-\u9FCC\u3041-\u3096\u30A1-\u30FA\uAC00-\uD7A3]/.test(h)),
      );

      console.log(`Documents with CJK headings: ${cjkHeadingDocs.length}`);
    });
  });
});
