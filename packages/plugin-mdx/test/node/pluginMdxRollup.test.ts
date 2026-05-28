import { describe, expect, it } from 'vitest';
import { escapeHtmlTags, pluginMdxRollup } from '../../src/pluginMdxRollup';

describe('escapeHtmlTags', () => {
  it('escapes lowercase HTML tags in markdown prose', () => {
    const input =
      'The document uses <head> for metadata, <body> for content, and <footer> for copyright.';
    const result = escapeHtmlTags(input, '/docs/guide.md');
    expect(result).toBe(
      'The document uses &lt;head> for metadata, &lt;body> for content, and &lt;footer> for copyright.',
    );
  });

  it('leaves code spans, fenced blocks, and operators alone', () => {
    const input = [
      'Use `<title>` and keep a < b.',
      '',
      '```html',
      '<head>',
      '</head>',
      '```',
    ].join('\n');

    expect(escapeHtmlTags(input, '/docs/guide.md')).toBe(input);
  });

  it('does not touch MDX files', () => {
    expect(escapeHtmlTags('<Alert />\n\n<img src="./athen.png" />', '/docs/demo.mdx')).toBe(
      '<Alert />\n\n<img src="./athen.png" />',
    );
  });
});

describe('pluginMdxRollup', () => {
  it('transforms markdown to a JavaScript module for Rolldown', { timeout: 30000 }, async () => {
    const plugins = await pluginMdxRollup({
      root: '/',
      base: '/',
      essor: true,
    });
    const mdxPlugin = plugins.find((plugin) => plugin.name === 'athen:mdx-rolldown')!;
    const transform = mdxPlugin.transform as {
      handler: (code: string, id: string) => Promise<{ code: string; moduleType?: string }>;
    };

    const result = await transform.handler('# Hello\n\n## Usage\n\nContent.', '/docs/index.md');

    expect(result.moduleType).toBe('js');
    expect(result.code).toContain('export const toc');
    expect(result.code).toContain('export const title = "Hello"');
    expect(result.code).toContain('function _createMdxContent');
  });

  it('keeps JSX components in MDX files', { timeout: 30000 }, async () => {
    const plugins = await pluginMdxRollup({ root: '/', base: '/', essor: true });
    const mdxPlugin = plugins.find((plugin) => plugin.name === 'athen:mdx-rolldown')!;
    const transform = mdxPlugin.transform as {
      handler: (code: string, id: string) => Promise<{ code: string; moduleType?: string }>;
    };

    const result = await transform.handler('<Alert>Message</Alert>', '/docs/component.mdx');

    expect(result.moduleType).toBe('js');
    expect(result.code).toContain('Alert');
  });
});
