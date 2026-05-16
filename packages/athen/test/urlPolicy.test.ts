import { describe, expect, it } from 'vitest';
import {
  applyRewrite,
  htmlFilePathFromRoute,
  normalizePublicRoute,
  normalizeRouteTarget,
} from '../src/shared/utils';

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
