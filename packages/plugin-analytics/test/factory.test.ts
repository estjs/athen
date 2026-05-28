import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('analyticsPlugin factory', () => {
  it('returns undefined when no options provided', () => {
    expect(analyticsPlugin()).toBeUndefined();
  });

  it('returns undefined when empty options provided', () => {
    expect(analyticsPlugin({})).toBeUndefined();
  });

  it('has the expected plugin name', () => {
    expect(analyticsPlugin({ google: { id: 'G-TEST' } })!.name).toBe('athen-plugin-analytics');
  });

  it('exposes a transformIndexHtml hook', () => {
    expect(typeof analyticsPlugin({ google: { id: 'G-TEST' } })!.transformIndexHtml).toBe(
      'function',
    );
  });
});
