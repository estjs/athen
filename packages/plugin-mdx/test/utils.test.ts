import { describe, it, expect } from 'vitest';
import {
  cleanUrl,
  createHash,
  parseUrl,
  isReg,
  MD_REGEX,
  DIRECTIVE_TYPES,
  LANGS,
  TARGET_BLANK_WHITE_LIST,
} from '../src/utils';

describe('cleanUrl', () => {
  it('should remove query parameters', () => {
    expect(cleanUrl('/path/to/file.md?query=value')).toBe('/path/to/file.md');
  });

  it('should remove hash fragments', () => {
    expect(cleanUrl('/path/to/file.md#section')).toBe('/path/to/file.md');
  });

  it('should remove both query and hash', () => {
    expect(cleanUrl('/path/to/file.md?query=value#section')).toBe('/path/to/file.md');
  });

  it('should handle URL with only hash', () => {
    expect(cleanUrl('/path/to/file.md#')).toBe('/path/to/file.md');
  });

  it('should handle URL with only query', () => {
    expect(cleanUrl('/path/to/file.md?')).toBe('/path/to/file.md');
  });

  it('should return unchanged URL without query or hash', () => {
    expect(cleanUrl('/path/to/file.md')).toBe('/path/to/file.md');
  });

  it('should handle empty string', () => {
    expect(cleanUrl('')).toBe('');
  });
});

describe('createHash', () => {
  it('should return 8-character hex string for valid input', () => {
    const hash = createHash('test-input');
    expect(hash).toHaveLength(8);
    expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
  });

  it('should return consistent hash for same input', () => {
    const hash1 = createHash('same-input');
    const hash2 = createHash('same-input');
    expect(hash1).toBe(hash2);
  });

  it('should return different hash for different input', () => {
    const hash1 = createHash('input-1');
    const hash2 = createHash('input-2');
    expect(hash1).not.toBe(hash2);
  });

  it('should throw error for empty string', () => {
    expect(() => createHash('')).toThrow('Invalid info');
  });

  it('should handle special characters', () => {
    const hash = createHash('特殊字符!@#$%^&*()');
    expect(hash).toHaveLength(8);
    expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
  });
});

describe('parseUrl', () => {
  it('should parse complete URL with path, query, and hash', () => {
    const result = parseUrl('/path/to/file?query=value#section');
    expect(result.url).toBe('/path/to/file');
    expect(result.query).toBe('query=value');
    expect(result.hash).toBe('section');
  });

  it('should parse URL with only path', () => {
    const result = parseUrl('/path/to/file');
    expect(result.url).toBe('/path/to/file');
    expect(result.query).toBe('');
    expect(result.hash).toBe('');
  });

  it('should parse URL with path and query', () => {
    const result = parseUrl('/path/to/file?query=value');
    expect(result.url).toBe('/path/to/file');
    expect(result.query).toBe('query=value');
    expect(result.hash).toBe('');
  });

  it('should parse URL with path and hash', () => {
    const result = parseUrl('/path/to/file#section');
    expect(result.url).toBe('/path/to/file');
    expect(result.query).toBe('');
    expect(result.hash).toBe('section');
  });

  it('should handle empty string', () => {
    const result = parseUrl('');
    expect(result.url).toBe('');
    expect(result.query).toBe('');
    expect(result.hash).toBe('');
  });

  it('should handle multiple hash symbols', () => {
    const result = parseUrl('/path#section#subsection');
    expect(result.url).toBe('/path');
    // parseUrl only captures the first hash segment
    expect(result.hash).toBe('section');
  });
});

describe('isReg', () => {
  it('should return true for RegExp instance', () => {
    expect(isReg(/test/)).toBe(true);
    expect(isReg(new RegExp('test'))).toBe(true);
  });

  it('should return false for string', () => {
    expect(isReg('test')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isReg(123)).toBe(false);
  });

  it('should return false for object', () => {
    expect(isReg({ pattern: 'test' })).toBe(false);
  });

  it('should return false for array', () => {
    expect(isReg([/test/])).toBe(false);
  });

  it('should throw for null (implementation detail)', () => {
    // isReg doesn't handle null gracefully - it throws
    expect(() => isReg(null)).toThrow();
  });

  it('should return false for undefined', () => {
    expect(isReg(undefined)).toBe(false);
  });
});

describe('MD_REGEX', () => {
  it('should match .md files', () => {
    expect(MD_REGEX.test('file.md')).toBe(true);
    expect(MD_REGEX.test('path/to/file.md')).toBe(true);
  });

  it('should match .mdx files', () => {
    expect(MD_REGEX.test('file.mdx')).toBe(true);
    expect(MD_REGEX.test('path/to/file.mdx')).toBe(true);
  });

  it('should not match other extensions', () => {
    expect(MD_REGEX.test('file.txt')).toBe(false);
    expect(MD_REGEX.test('file.js')).toBe(false);
    expect(MD_REGEX.test('file.ts')).toBe(false);
    expect(MD_REGEX.test('file.html')).toBe(false);
  });

  it('should not match files with md in name but different extension', () => {
    expect(MD_REGEX.test('readme.txt')).toBe(false);
    expect(MD_REGEX.test('markdown.js')).toBe(false);
  });

  it('should match case sensitively', () => {
    expect(MD_REGEX.test('file.MD')).toBe(false);
    expect(MD_REGEX.test('file.MDX')).toBe(false);
  });
});

describe('DIRECTIVE_TYPES', () => {
  it('should contain expected directive types', () => {
    expect(DIRECTIVE_TYPES).toContain('tip');
    expect(DIRECTIVE_TYPES).toContain('warning');
    expect(DIRECTIVE_TYPES).toContain('danger');
    expect(DIRECTIVE_TYPES).toContain('info');
  });

  it('should have 4 directive types', () => {
    expect(DIRECTIVE_TYPES).toHaveLength(4);
  });
});

describe('LANGS', () => {
  it('should contain common programming languages', () => {
    expect(LANGS).toContain('javascript');
    expect(LANGS).toContain('typescript');
    expect(LANGS).toContain('python');
    expect(LANGS).toContain('java');
    expect(LANGS).toContain('rust');
  });

  it('should contain markup languages', () => {
    expect(LANGS).toContain('html');
    expect(LANGS).toContain('css');
    expect(LANGS).toContain('markdown');
    expect(LANGS).toContain('mdx');
  });

  it('should contain shell languages', () => {
    expect(LANGS).toContain('shell');
    expect(LANGS).toContain('bash');
  });
});

describe('TARGET_BLANK_WHITE_LIST', () => {
  it('should contain essor related URLs', () => {
    expect(TARGET_BLANK_WHITE_LIST).toContain('https://essor.netlify.app/');
    expect(TARGET_BLANK_WHITE_LIST).toContain('https://essor-playground.netlify.app/');
    expect(TARGET_BLANK_WHITE_LIST).toContain('https://essor-router.netlify.app/');
  });
});
