import { describe, expect, it } from 'vitest';
import { getLocalePath } from '../src/theme-default/hooks/localePath';

describe('getLocalePath', () => {
  it('keeps root locale links normalized to a single slash', () => {
    expect(getLocalePath('/guide/getting-started', '/', ['/', '/zh/'])).toBe(
      '/guide/getting-started',
    );
    expect(getLocalePath('/missing', '/', [])).toBe('/');
  });

  it('switches between root and prefixed locale paths', () => {
    expect(getLocalePath('/guide/getting-started', '/zh/', ['/', '/zh/'])).toBe(
      '/zh/guide/getting-started',
    );
    expect(getLocalePath('/zh/guide/getting-started', '/', ['/', '/zh/'])).toBe(
      '/guide/getting-started',
    );
  });
});
