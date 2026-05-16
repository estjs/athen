import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { rehypePluginPreWrapper } from '../src/rehypePlugins/preWrapper';

describe('rehypePluginPreWrapper', () => {
  const processHtml = async (
    html: string,
    options?: Parameters<typeof rehypePluginPreWrapper>[0],
  ) => {
    const processor = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypePluginPreWrapper, options)
      .use(rehypeStringify);
    const result = await processor.process(html);
    return String(result);
  };

  it('should add line number markup when enabled', async () => {
    const html = await processHtml(
      '<pre><code class="language-ts">const a = 1;\nconst b = 2;\n</code></pre>',
      {
        lineNumbers: true,
      },
    );

    expect(html).toContain('line-numbers-mode');
    expect(html).toContain('line-numbers-wrapper');
    expect(html).toContain('>1</span>');
    expect(html).toContain('>2</span>');
  });

  it('should keep code blocks compact when line numbers are disabled', async () => {
    const html = await processHtml('<pre><code class="language-ts">const a = 1;</code></pre>');

    expect(html).not.toContain('line-numbers-mode');
    expect(html).not.toContain('line-numbers-wrapper');
  });

  it('should read the language from code blocks with extra classes', async () => {
    const html = await processHtml(
      '<pre><code class="language-ts extra-class">const a = 1;</code></pre>',
    );

    expect(html).toContain('<span class="lang">ts</span>');
    expect(html).not.toContain('<span class="lang">ts extra-class</span>');
  });
});
