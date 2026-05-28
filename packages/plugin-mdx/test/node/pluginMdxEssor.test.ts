import { describe, expect, it } from 'vitest';
import { pluginMdxEssor } from '../../src/pluginMdxEssor';

describe('pluginMdxEssor', () => {
  const plugin = pluginMdxEssor();

  it('rewrites `_components.X` JSX tags in markdown to plain X', () => {
    const code = '<_components.h1>Title</_components.h1>\n<_components.p>Body</_components.p>';
    const result = (plugin.transform as any).call({}, code, '/docs/guide.md');

    expect(result?.moduleType).toBe('js');
    expect(result?.code).toBe('<h1>Title</h1>\n<p>Body</p>');
  });

  it('also rewrites markdown sources with query strings', () => {
    const result = (plugin.transform as any).call(
      {},
      '<_components.h2>X</_components.h2>',
      '/docs/guide.md?hmr',
    );

    expect(result?.code).toBe('<h2>X</h2>');
  });

  it('does not touch .ts or .tsx files', () => {
    const result = (plugin.transform as any).call(
      {},
      '<_components.h1>X</_components.h1>',
      '/docs/component.tsx',
    );

    expect(result).toBeUndefined();
  });
});
