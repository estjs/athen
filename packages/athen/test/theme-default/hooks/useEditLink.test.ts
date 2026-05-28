import { describe, expect, it } from 'vitest';
import { useEditLink } from '../../../src/theme-default/hooks/useEditLink';

describe('useEditLink', () => {
  it('returns null when editLink is not configured', () => {
    expect(useEditLink(undefined, 'guide/intro.md')).toBeNull();
  });

  it('substitutes :path in the pattern with the relative page path', () => {
    expect(
      useEditLink(
        { pattern: 'https://github.com/example/repo/edit/main/docs/:path' },
        'guide/intro.md',
      ),
    ).toEqual({
      text: 'Edit this page',
      link: 'https://github.com/example/repo/edit/main/docs/guide/intro.md',
    });
  });

  it('falls back to an empty path when relativePagePath is missing', () => {
    expect(useEditLink({ pattern: 'https://example.com/edit/:path' })).toEqual({
      text: 'Edit this page',
      link: 'https://example.com/edit/',
    });
  });

  it('uses the configured text override when provided', () => {
    expect(
      useEditLink(
        { pattern: 'https://example.com/edit/:path', text: '在 GitHub 上编辑此页' },
        'zh/guide/intro.md',
      ),
    ).toEqual({
      text: '在 GitHub 上编辑此页',
      link: 'https://example.com/edit/zh/guide/intro.md',
    });
  });
});
