import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Header, backTrackHeaders, debounce, highlightText } from '../src/client/utils';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it('should use default delay of 200ms', () => {
    const fn = vi.fn();
    const debounced = debounce(fn);

    debounced();
    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('backTrackHeaders', () => {
  const headers: Header[] = [
    { id: '1', text: 'Section 1', depth: 2 },
    { id: '2', text: 'Subsection 1.1', depth: 3 },
    { id: '3', text: 'Detail 1.1.1', depth: 4 },
    { id: '4', text: 'Section 2', depth: 2 },
    { id: '5', text: 'Subsection 2.1', depth: 3 },
  ];

  it('should return empty array for null/undefined input', () => {
    expect(backTrackHeaders(null as any, 0)).toEqual([]);
    expect(backTrackHeaders(undefined as any, 0)).toEqual([]);
  });

  it('should return empty array for empty headers', () => {
    expect(backTrackHeaders([], 0)).toEqual([]);
  });

  it('should return empty array for negative index', () => {
    expect(backTrackHeaders(headers, -1)).toEqual([]);
  });

  it('should return empty array for out of bounds index', () => {
    expect(backTrackHeaders(headers, 10)).toEqual([]);
  });

  it('should return single header for depth 2', () => {
    const result = backTrackHeaders(headers, 0);
    expect(result.length).toBe(1);
    expect(result[0].text).toBe('Section 1');
  });

  it('should backtrack to parent for depth 3', () => {
    const result = backTrackHeaders(headers, 1);
    expect(result.length).toBe(2);
    expect(result[0].text).toBe('Section 1');
    expect(result[1].text).toBe('Subsection 1.1');
  });

  it('should backtrack through multiple levels', () => {
    const result = backTrackHeaders(headers, 2);
    expect(result.length).toBe(3);
    expect(result[0].text).toBe('Section 1');
    expect(result[1].text).toBe('Subsection 1.1');
    expect(result[2].text).toBe('Detail 1.1.1');
  });

  it('should find correct parent in different section', () => {
    const result = backTrackHeaders(headers, 4);
    expect(result.length).toBe(2);
    expect(result[0].text).toBe('Section 2');
    expect(result[1].text).toBe('Subsection 2.1');
  });
});

describe('highlightText', () => {
  it('should return null for empty text', () => {
    expect(highlightText('', 'query')).toBeNull();
  });

  it('should return null for empty query', () => {
    expect(highlightText('some text', '')).toBeNull();
  });

  it('should return null when query not found', () => {
    expect(highlightText('hello world', 'xyz')).toBeNull();
  });

  it('should split text correctly when query at start', () => {
    const result = highlightText('hello world', 'hello');
    expect(result).toEqual({
      prefix: '',
      match: 'hello',
      suffix: ' world',
    });
  });

  it('should split text correctly when query at end', () => {
    const result = highlightText('hello world', 'world');
    expect(result).toEqual({
      prefix: 'hello ',
      match: 'world',
      suffix: '',
    });
  });

  it('should split text correctly when query in middle', () => {
    const result = highlightText('hello beautiful world', 'beautiful');
    expect(result).toEqual({
      prefix: 'hello ',
      match: 'beautiful',
      suffix: ' world',
    });
  });

  it('should be case insensitive', () => {
    const result = highlightText('Hello World', 'world');
    expect(result).not.toBeNull();
    expect(result?.match).toBe('World');
  });

  it('should preserve original case in match', () => {
    const result = highlightText('FlexSearch is GREAT', 'great');
    expect(result?.match).toBe('GREAT');
  });

  it('should find first occurrence only', () => {
    const result = highlightText('test test test', 'test');
    expect(result).toEqual({
      prefix: '',
      match: 'test',
      suffix: ' test test',
    });
  });
});
