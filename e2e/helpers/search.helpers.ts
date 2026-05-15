import type { Page, Locator } from '@playwright/test';

/**
 * CSS Selectors for search components
 */
export const SELECTORS = {
  searchBox: '.athen-search-box',
  searchInput: '.search-input',
  searchInputContainer: '.search-input-container',
  searchResults: '.search-results',
  resultItem: '.result-item',
  resultTitle: '.result-title',
  resultContent: '.result-content',
  resultHeading: '.result-heading',
  resultLink: '.result-link',
  noResults: '.no-results',
  searchLoading: '.search-loading',
  searchHighlight: '.search-highlight',
  activeResult: '.result-item.active',
  resultsList: '.results-list',
  // Algolia specific
  docSearchContainer: '#docsearch',
  docSearchHit: '.DocSearch-Hit',
  docSearchInput: '#docsearch input',
} as const;

/**
 * Search index data structure
 */
export interface SearchDocument {
  id: number;
  path: string;
  title: string;
  headings: string[];
  content: string;
  rawHeaders?: Array<{
    id: string;
    text: string;
    depth: number;
  }>;
}

export interface SearchIndexData {
  documents: SearchDocument[];
  options: Record<string, unknown>;
}

/**
 * Search page helper class for E2E tests
 */
export class SearchPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly resultItems: Locator;
  readonly noResults: Locator;
  readonly searchLoading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator(SELECTORS.searchBox);
    this.searchInput = page.locator(SELECTORS.searchInput);
    this.searchResults = page.locator(SELECTORS.searchResults);
    this.resultItems = page.locator(SELECTORS.resultItem);
    this.noResults = page.locator(SELECTORS.noResults);
    this.searchLoading = page.locator(SELECTORS.searchLoading);
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoLocale(locale: 'en' | 'zh'): Promise<void> {
    await this.goto(locale === 'en' ? '/' : `/${locale}/`);
  }

  async focusSearchBox(): Promise<void> {
    await this.searchInput.click();
  }

  async typeSearchQuery(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
  }

  async typeSearchQuerySequentially(query: string, delay = 50): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.pressSequentially(query, { delay });
  }

  async clearSearchQuery(): Promise<void> {
    await this.searchInput.clear();
  }

  async pressSearchShortcut(): Promise<void> {
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifier}+k`);
  }

  async waitForResults(timeout = 5000): Promise<void> {
    await this.searchResults.waitFor({ state: 'visible', timeout });
  }

  async waitForResultItems(timeout = 5000): Promise<void> {
    await this.page.waitForSelector(SELECTORS.resultItem, { timeout });
  }

  async getResultsCount(): Promise<number> {
    return this.resultItems.count();
  }

  async getResultTitles(): Promise<string[]> {
    return this.page.locator(`${SELECTORS.resultItem} ${SELECTORS.resultTitle}`).allTextContents();
  }

  async getResultPaths(): Promise<string[]> {
    const links = this.page.locator(`${SELECTORS.resultItem} ${SELECTORS.resultLink}`);
    const count = await links.count();
    const paths: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href) paths.push(href);
    }
    return paths;
  }

  async clickResult(index: number): Promise<void> {
    await this.resultItems.nth(index).click();
  }

  async pressArrowDown(): Promise<void> {
    await this.page.keyboard.press('ArrowDown');
  }

  async pressArrowUp(): Promise<void> {
    await this.page.keyboard.press('ArrowUp');
  }

  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async isSearchBoxVisible(): Promise<boolean> {
    return this.searchBox.isVisible();
  }

  async isSearchInputFocused(): Promise<boolean> {
    return this.searchInput.evaluate((el) => document.activeElement === el);
  }

  async isResultsVisible(): Promise<boolean> {
    return this.searchResults.isVisible();
  }

  async isNoResultsVisible(): Promise<boolean> {
    return this.noResults.isVisible();
  }

  async getSearchIndex(): Promise<SearchIndexData | null> {
    return this.page.evaluate(() => (window as any).__ATHEN_SEARCH_INDEX__ || null);
  }

  async getDocumentCount(): Promise<number> {
    const index = await this.getSearchIndex();
    return index?.documents?.length || 0;
  }

  async getDocumentPaths(): Promise<string[]> {
    const index = await this.getSearchIndex();
    return index?.documents?.map((d) => d.path) || [];
  }

  async isSearchIndexLoaded(): Promise<boolean> {
    return this.page.evaluate(() => {
      const index = (window as any).__ATHEN_SEARCH_INDEX__;
      return typeof index !== 'undefined' && index?.documents?.length > 0;
    });
  }

  async getHighlightCount(): Promise<number> {
    return this.page.locator(SELECTORS.searchHighlight).count();
  }

  async clickOutside(): Promise<void> {
    await this.page.click('body', { position: { x: 10, y: 10 } });
  }
}

export function validateSearchIndex(index: SearchIndexData | null): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!index) {
    errors.push('Search index is null or undefined');
    return { valid: false, errors };
  }

  if (!Array.isArray(index.documents)) {
    errors.push('documents is not an array');
  }

  if (typeof index.options !== 'object') {
    errors.push('options is not an object');
  }

  if (index.documents) {
    for (let i = 0; i < index.documents.length; i++) {
      const doc = index.documents[i];
      if (!doc.path?.startsWith('/')) {
        errors.push(`Document ${i}: path does not start with /`);
      }
      if (doc.path?.match(/\.(md|mdx)$/)) {
        errors.push(`Document ${i}: path contains file extension`);
      }
      if (typeof doc.title !== 'string') {
        errors.push(`Document ${i}: title is not a string`);
      }
      if (!Array.isArray(doc.headings)) {
        errors.push(`Document ${i}: headings is not an array`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function containsHtmlTags(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}
