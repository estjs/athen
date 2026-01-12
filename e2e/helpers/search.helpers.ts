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

  /**
   * Navigate to a page
   */
  async goto(path = '/'): Promise<void> {
    // If path is a full URL, use it directly; otherwise use relative path
    if (path.startsWith('http')) {
      await this.page.goto(path);
    } else {
      await this.page.goto(path);
    }
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to a specific locale
   */
  async gotoLocale(locale: 'en' | 'zh'): Promise<void> {
    await this.goto(`/${locale}/`);
  }

  /**
   * Focus the search box
   */
  async focusSearchBox(): Promise<void> {
    await this.searchInput.click();
  }

  /**
   * Type a search query
   */
  async typeSearchQuery(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
  }

  /**
   * Type a search query character by character (for debounce testing)
   */
  async typeSearchQuerySequentially(query: string, delay = 50): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.pressSequentially(query, { delay });
  }

  /**
   * Clear the search query
   */
  async clearSearchQuery(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Press a keyboard shortcut
   */
  async pressShortcut(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Press Cmd/Ctrl+K to open search
   */
  async pressSearchShortcut(): Promise<void> {
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifier}+k`);
  }

  /**
   * Wait for search results to appear
   */
  async waitForResults(timeout = 5000): Promise<void> {
    await this.searchResults.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for result items to appear
   */
  async waitForResultItems(timeout = 5000): Promise<void> {
    await this.page.waitForSelector(SELECTORS.resultItem, { timeout });
  }

  /**
   * Get the count of search results
   */
  async getResultsCount(): Promise<number> {
    return this.resultItems.count();
  }

  /**
   * Get all result titles
   */
  async getResultTitles(): Promise<string[]> {
    const titles = await this.page.locator(`${SELECTORS.resultItem} ${SELECTORS.resultTitle}`).allTextContents();
    return titles;
  }

  /**
   * Get all result paths
   */
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

  /**
   * Click a result by index
   */
  async clickResult(index: number): Promise<void> {
    await this.resultItems.nth(index).click();
  }

  /**
   * Press ArrowDown key
   */
  async pressArrowDown(): Promise<void> {
    await this.page.keyboard.press('ArrowDown');
  }

  /**
   * Press ArrowUp key
   */
  async pressArrowUp(): Promise<void> {
    await this.page.keyboard.press('ArrowUp');
  }

  /**
   * Press Enter key
   */
  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  /**
   * Press Escape key
   */
  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  /**
   * Check if search box is visible
   */
  async isSearchBoxVisible(): Promise<boolean> {
    return this.searchBox.isVisible();
  }

  /**
   * Check if search input is focused
   */
  async isSearchInputFocused(): Promise<boolean> {
    return this.searchInput.evaluate((el) => document.activeElement === el);
  }

  /**
   * Check if results dropdown is visible
   */
  async isResultsVisible(): Promise<boolean> {
    return this.searchResults.isVisible();
  }

  /**
   * Check if no results message is visible
   */
  async isNoResultsVisible(): Promise<boolean> {
    return this.noResults.isVisible();
  }

  /**
   * Check if loading indicator is visible
   */
  async isLoadingVisible(): Promise<boolean> {
    return this.searchLoading.isVisible();
  }

  /**
   * Get the index of the active (highlighted) result
   */
  async getActiveResultIndex(): Promise<number> {
    const items = await this.resultItems.all();
    for (let i = 0; i < items.length; i++) {
      const className = await items[i].getAttribute('class');
      if (className?.includes('active')) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if a result item has the active class
   */
  async isResultActive(index: number): Promise<boolean> {
    const item = this.resultItems.nth(index);
    const className = await item.getAttribute('class');
    return className?.includes('active') ?? false;
  }

  /**
   * Get the search index from the page
   */
  async getSearchIndex(): Promise<SearchIndexData | null> {
    return this.page.evaluate(() => {
      return (window as any).__ATHEN_SEARCH_INDEX__ || null;
    });
  }

  /**
   * Get the document count from the search index
   */
  async getDocumentCount(): Promise<number> {
    const index = await this.getSearchIndex();
    return index?.documents?.length || 0;
  }

  /**
   * Get all document paths from the search index
   */
  async getDocumentPaths(): Promise<string[]> {
    const index = await this.getSearchIndex();
    return index?.documents?.map((d) => d.path) || [];
  }

  /**
   * Check if search index is loaded
   */
  async isSearchIndexLoaded(): Promise<boolean> {
    return this.page.evaluate(() => {
      const index = (window as any).__ATHEN_SEARCH_INDEX__;
      return typeof index !== 'undefined' && index?.documents?.length > 0;
    });
  }

  /**
   * Get highlight elements count
   */
  async getHighlightCount(): Promise<number> {
    return this.page.locator(SELECTORS.searchHighlight).count();
  }

  /**
   * Click outside the search box to close it
   */
  async clickOutside(): Promise<void> {
    await this.page.click('body', { position: { x: 10, y: 10 } });
  }

  /**
   * Check if Algolia DocSearch container exists
   */
  async hasAlgoliaDocSearch(): Promise<boolean> {
    const count = await this.page.locator(SELECTORS.docSearchContainer).count();
    return count > 0;
  }
}

/**
 * Validate search index structure
 */
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

/**
 * Check if content contains HTML tags
 */
export function containsHtmlTags(content: string): boolean {
  // Check for common HTML tag patterns
  return /<[a-z][\s\S]*>/i.test(content);
}
