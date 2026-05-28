import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { remarkPluginNormalizeLink } from '../../src/remarkPlugins/link';

const processMarkdown = async (markdown: string, options = { base: '/', enableSpa: true }) => {
  const processor = unified().use(remarkParse).use(remarkPluginNormalizeLink, options);
  return await processor.run(processor.parse(markdown));
};

describe('remarkPluginNormalizeLink', () => {
  it('should remove .md extension from links', async () => {
    const markdown = '[Link](./guide.md)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).not.toContain('.md');
  });

  it('should remove .mdx extension from links', async () => {
    const markdown = '[Link](./component.mdx)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).not.toContain('.mdx');
  });

  it('should preserve hash in links', async () => {
    const markdown = '[Link](./guide.md#section)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).toContain('#section');
  });

  it('should not modify external http links', async () => {
    const markdown = '[External](https://example.com/page.md)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).toBe('https://example.com/page.md');
  });

  it('should not modify anchor links', async () => {
    const markdown = '[Anchor](#section)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).toBe('#section');
  });

  it('should apply base path', async () => {
    const markdown = '[Link](./guide.md)';
    const result = await processMarkdown(markdown, { base: '/docs/', enableSpa: true });

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).toContain('docs');
  });

  it('should handle links without extension', async () => {
    const markdown = '[Link](./guide)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).toContain('guide');
  });
});
