import {
  CJK_TEST_DATA,
  LOCALE_CASES,
  TEST_QUERIES,
  expect,
  test,
} from '../fixtures/search.fixture';

test.describe('search internationalization', () => {
  test('English root-locale results never carry a /zh/ or /en/ prefix', async ({ searchPage }) => {
    await searchPage.gotoLocale('en');

    await searchPage.typeSearchQuery('Quick Start');
    await searchPage.waitForResultItems();

    const paths = await searchPage.getResultPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).not.toMatch(/^\/zh\//);
      expect(path).not.toMatch(/^\/en\//);
    }
  });

  test('Chinese locale results all carry the /zh/ prefix', async ({ searchPage }) => {
    await searchPage.gotoLocale('zh');

    await searchPage.typeSearchQuery('快速开始');
    await searchPage.waitForResultItems();

    const paths = await searchPage.getResultPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).toMatch(/^\/zh\//);
    }
  });

  test('navigating from a search result preserves the current locale', async ({ searchPage }) => {
    await searchPage.gotoLocale('en');

    await searchPage.typeSearchQuery('guide');
    await searchPage.waitForResultItems();
    await searchPage.clickResult(0);

    await expect(searchPage.page).not.toHaveURL(/\/zh\//);
    await expect(searchPage.page).not.toHaveURL(/\/en\//);
  });

  test.describe('parameterized locale cases', () => {
    for (const localeCase of LOCALE_CASES) {
      test(`${localeCase.locale} locale search for "${localeCase.query}"`, async ({
        searchPage,
      }) => {
        await searchPage.gotoLocale(localeCase.locale);

        await searchPage.typeSearchQuery(localeCase.query);
        await searchPage.waitForResultItems();

        expect(await searchPage.getResultsCount()).toBeGreaterThan(0);

        const paths = await searchPage.getResultPaths();
        for (const path of paths) {
          if (localeCase.locale === 'en') {
            expect(path).not.toMatch(/^\/zh\//);
            expect(path).not.toMatch(/^\/en\//);
          } else {
            expect(path).toContain(localeCase.pathPrefix);
          }
        }
      });
    }
  });

  test.describe('CJK content', () => {
    test('Chinese content search returns at least one result', async ({ searchPage }) => {
      await searchPage.gotoLocale('zh');

      await searchPage.typeSearchQuery('快速开始');
      await searchPage.waitForResultItems();
      expect(await searchPage.getResultsCount()).toBeGreaterThan(0);
    });

    test('search index contains documents with Chinese title or content', async ({ searchPage }) => {
      await searchPage.goto('/');

      const index = await searchPage.getSearchIndex();
      const chineseDocs = (index?.documents || []).filter(
        (doc) =>
          CJK_TEST_DATA.chinese.expectedChars.test(doc.title) ||
          CJK_TEST_DATA.chinese.expectedChars.test(doc.content),
      );
      expect(chineseDocs.length).toBeGreaterThan(0);
    });

    test('each Chinese query either shows results or a no-results message', async ({
      searchPage,
    }) => {
      await searchPage.gotoLocale('zh');

      for (const query of TEST_QUERIES.chinese) {
        await searchPage.clearSearchQuery();
        await searchPage.typeSearchQuery(query);

        // Either results or the no-results message must become visible — no hard sleep.
        await expect(async () => {
          const hasResults = await searchPage.isResultsVisible();
          const hasNoResults = await searchPage.isNoResultsVisible();
          expect(hasResults || hasNoResults).toBe(true);
        }).toPass({ timeout: 5000 });
      }
    });
  });

  test('search index is shared across locales (same document count)', async ({ searchPage }) => {
    await searchPage.gotoLocale('en');
    const enCount = await searchPage.getDocumentCount();

    await searchPage.gotoLocale('zh');
    const zhCount = await searchPage.getDocumentCount();

    expect(enCount).toBe(zhCount);
  });
});
