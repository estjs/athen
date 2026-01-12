import { test as base } from '@playwright/test';
import { SearchPage, SELECTORS } from '../helpers/search.helpers';

// Re-export SELECTORS for convenience
export { SELECTORS };

/**
 * Test configuration for search tests
 */
export const SEARCH_CONFIG = {
  // Use empty string to use baseURL from playwright config
  baseUrl: '',
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  searchDebounceMs: 150,
  maxResults: 7,
  defaultTimeout: 5000,
} as const;

/**
 * Test queries for different scenarios
 */
export const TEST_QUERIES = {
  // English queries that should return results
  english: ['Quick Start', 'guide', 'configuration', 'Vite', 'getting-started'],
  // Chinese queries that should return results
  chinese: ['快速开始', '指南', '配置'],
  // Query that should return no results
  noMatch: 'xyznonexistentquery123',
  // Partial word for prefix matching test
  partial: 'get',
  // Whitespace-only queries
  whitespace: ['', '   ', '\t', '\n'],
} as const;

/**
 * Expected search result patterns
 */
export interface ExpectedSearchResult {
  query: string;
  minResults: number;
  expectedTitlePattern?: RegExp;
  expectedPathPattern?: RegExp;
}

export const EXPECTED_RESULTS: ExpectedSearchResult[] = [
  {
    query: 'Quick Start',
    minResults: 1,
    expectedTitlePattern: /Quick Start|快速开始/i,
    expectedPathPattern: /getting-started/,
  },
  {
    query: 'guide',
    minResults: 1,
    expectedPathPattern: /guide/,
  },
  {
    query: '快速开始',
    minResults: 1,
    expectedTitlePattern: /快速开始|Quick Start/i,
  },
];

/**
 * Keyboard navigation test cases
 */
export const KEYBOARD_NAV_CASES = [
  { action: 'ArrowDown', fromIndex: -1, expectedIndex: 0 },
  { action: 'ArrowDown', fromIndex: 0, expectedIndex: 1 },
  { action: 'ArrowUp', fromIndex: 1, expectedIndex: 0 },
  { action: 'ArrowUp', fromIndex: 0, expectedIndex: -1 },
] as const;

/**
 * Locale test cases
 */
export const LOCALE_CASES = [
  { locale: 'en' as const, query: 'Quick Start', pathPrefix: '/en/' },
  { locale: 'zh' as const, query: '快速开始', pathPrefix: '/zh/' },
] as const;

/**
 * Extended test fixture with SearchPage
 */
export const test = base.extend<{ searchPage: SearchPage }>({
  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper to wait for debounce
 */
export async function waitForDebounce(ms = SEARCH_CONFIG.searchDebounceMs + 50): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random whitespace string
 */
export function generateWhitespace(): string {
  const chars = [' ', '\t', '\n', '  ', '\t\t'];
  const length = Math.floor(Math.random() * 5) + 1;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Test data for CJK content
 */
export const CJK_TEST_DATA = {
  chinese: {
    queries: ['快速开始', '指南', '配置', '文档'],
    expectedChars: /[\u4E00-\u9FCC]/,
  },
  japanese: {
    queries: ['はじめに', 'ガイド'],
    expectedChars: /[\u3041-\u3096\u30A1-\u30FA]/,
  },
  korean: {
    queries: ['시작하기', '가이드'],
    expectedChars: /[\uAC00-\uD7A3]/,
  },
} as const;
