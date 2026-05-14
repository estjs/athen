import { describe, expect, it } from 'vitest';
import {
  getRelativePagePath,
  normalizeRoutePath,
  removeBase,
  withBase,
} from '../src/shared/utils';

describe('shared path utils', () => {
  it('normalizes base paths without duplicating slashes', () => {
    expect(withBase('/guide', '/docs/')).toBe('/docs/guide');
    expect(withBase('guide', '/docs')).toBe('/docs/guide');
    expect(withBase('/guide', '/')).toBe('/guide');
    expect(withBase('https://example.com/a', '/docs')).toBe('https://example.com/a');
  });

  it('removes only the configured base from internal urls', () => {
    expect(removeBase('/docs/guide?tab=api#intro', '/docs/')).toBe('/guide');
    expect(removeBase('/docs', '/docs/')).toBe('/');
    expect(removeBase('/guide', '/docs/')).toBe('/guide');
    expect(removeBase('https://example.com/docs', '/docs/')).toBe('https://example.com/docs');
  });

  it('derives source page paths from routed urls and original file extensions', () => {
    expect(getRelativePagePath('/docs/guide', 'guide.md', '/docs/')).toBe('guide.md');
    expect(getRelativePagePath('/docs/', 'index.mdx', '/docs/')).toBe('index.mdx');
    expect(getRelativePagePath('/docs/guide/', 'guide/index.md', '/docs/')).toBe('guide.md');
  });

  it('normalizes html route paths', () => {
    expect(normalizeRoutePath('/guide/index.html')).toBe('/guide/');
    expect(normalizeRoutePath('/guide.html')).toBe('/guide');
  });
});
