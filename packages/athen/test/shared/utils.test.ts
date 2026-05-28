import { describe, expect, it } from 'vitest';
import {
  applyRewrite,
  getRelativePagePath,
  htmlFilePathFromRoute,
  normalizePublicRoute,
  normalizeRoutePath,
  normalizeRouteTarget,
  removeBase,
  withBase,
} from '../../src/shared/utils';

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

describe('url policy', () => {
  it('normalizes index and root routes without losing the root slash', () => {
    expect(normalizePublicRoute('/guide/index', { cleanUrls: true, trailingSlash: true })).toBe(
      '/guide/',
    );
    expect(normalizePublicRoute('/guide/index', { cleanUrls: true, trailingSlash: false })).toBe(
      '/guide',
    );
    expect(normalizePublicRoute('/', { cleanUrls: true, trailingSlash: false })).toBe('/');
  });

  it('applies trailing slash policy to regular routes', () => {
    expect(normalizePublicRoute('/guide/start', { trailingSlash: true })).toBe('/guide/start/');
    expect(normalizePublicRoute('/guide/start/', { trailingSlash: false })).toBe('/guide/start');
  });

  it('normalizes route targets before comparing links', () => {
    expect(normalizeRouteTarget('/guide/start.md#install', { trailingSlash: false })).toBe(
      '/guide/start#install',
    );
    expect(normalizeRouteTarget('/guide/start.html', { trailingSlash: true })).toBe(
      '/guide/start/',
    );
  });

  it('applies simple rewrites after target normalization', () => {
    expect(
      applyRewrite('/old-start', {
        trailingSlash: false,
        rewrites: { '/old-start': '/guide/getting-started' },
      }),
    ).toBe('/guide/getting-started');
  });

  it('maps canonical routes to html output files', () => {
    expect(htmlFilePathFromRoute('/guide/start', { cleanUrls: true })).toBe('guide/start.html');
    expect(htmlFilePathFromRoute('/guide/start/', { trailingSlash: true })).toBe(
      'guide/start/index.html',
    );
    expect(htmlFilePathFromRoute('/', { cleanUrls: true })).toBe('index.html');
  });
});
