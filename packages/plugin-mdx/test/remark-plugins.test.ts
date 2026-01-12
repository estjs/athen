import { describe, it, expect, vi, beforeEach } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { remarkPluginToc } from '../src/remarkPlugins/toc';
import { remarkPluginTip } from '../src/remarkPlugins/tip';
import { remarkPluginNormalizeLink } from '../src/remarkPlugins/link';

describe('remarkPluginToc', () => {
  const processMarkdown = async (markdown: string) => {
    const processor = unified().use(remarkParse).use(remarkPluginToc);
    const result = await processor.run(processor.parse(markdown));
    return result;
  };

  it('should extract h2-h4 headings into toc', async () => {
    const markdown = `# Title

## Section 1

### Subsection 1.1

## Section 2

#### Deep Section
`;
    const result = await processMarkdown(markdown);

    // Find the mdxjsEsm node containing toc
    const tocNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const toc'),
    );

    expect(tocNode).toBeDefined();
    expect(tocNode.value).toContain('Section 1');
    expect(tocNode.value).toContain('Subsection 1.1');
    expect(tocNode.value).toContain('Section 2');
    expect(tocNode.value).toContain('Deep Section');
  });

  it('should export title from h1', async () => {
    const markdown = `# My Document Title

## Section
`;
    const result = await processMarkdown(markdown);

    const titleNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const title'),
    );

    expect(titleNode).toBeDefined();
    expect(titleNode.value).toContain('My Document Title');
  });

  it('should generate slugified ids', async () => {
    const markdown = `# Title

## Hello World

## Special Characters & Symbols
`;
    const result = await processMarkdown(markdown);

    const tocNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const toc'),
    );

    expect(tocNode.value).toContain('hello-world');
    expect(tocNode.value).toContain('special-characters--symbols');
  });

  it('should include depth information', async () => {
    const markdown = `# Title

## Level 2

### Level 3

#### Level 4
`;
    const result = await processMarkdown(markdown);

    const tocNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const toc'),
    );

    expect(tocNode.value).toContain('"depth": 2');
    expect(tocNode.value).toContain('"depth": 3');
    expect(tocNode.value).toContain('"depth": 4');
  });

  it('should handle empty document', async () => {
    const markdown = '';
    const result = await processMarkdown(markdown);

    const tocNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const toc'),
    );

    expect(tocNode).toBeDefined();
    expect(tocNode.value).toContain('[]');
  });

  it('should not include h5 and h6 in toc', async () => {
    const markdown = `# Title

## Section

##### H5 Heading

###### H6 Heading
`;
    const result = await processMarkdown(markdown);

    const tocNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const toc'),
    );

    expect(tocNode.value).not.toContain('H5 Heading');
    expect(tocNode.value).not.toContain('H6 Heading');
  });
});

describe('remarkPluginTip', () => {
  const processMarkdown = async (markdown: string) => {
    const processor = unified().use(remarkParse).use(remarkDirective).use(remarkPluginTip);
    const result = await processor.run(processor.parse(markdown));
    return result;
  };

  it('should transform tip directive', async () => {
    const markdown = `:::tip
This is a tip
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode).toBeDefined();
    expect(directiveNode.data.hName).toBe('div');
    expect(directiveNode.data.hProperties.class).toContain('at-directive');
    expect(directiveNode.data.hProperties.class).toContain('tip');
  });

  it('should transform warning directive', async () => {
    const markdown = `:::warning
This is a warning
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.data.hProperties.class).toContain('warning');
  });

  it('should transform danger directive', async () => {
    const markdown = `:::danger
This is dangerous
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.data.hProperties.class).toContain('danger');
  });

  it('should transform info directive', async () => {
    const markdown = `:::info
This is info
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.data.hProperties.class).toContain('info');
  });

  it('should use custom title when provided', async () => {
    const markdown = `:::tip{title="Custom Title"}
This is a tip with custom title
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.children[0].children[0].value).toBe('Custom Title');
  });

  it('should use default title when not provided', async () => {
    const markdown = `:::tip
This is a tip
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.children[0].children[0].value).toBe('TIP');
  });

  it('should fallback to tip for unknown directive types', async () => {
    const markdown = `:::unknown
This is unknown
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.data.hProperties.class).toContain('tip');
  });
});

describe('remarkPluginNormalizeLink', () => {
  const processMarkdown = async (markdown: string, options = { base: '/', enableSpa: true }) => {
    const processor = unified().use(remarkParse).use(remarkPluginNormalizeLink, options);
    const result = await processor.run(processor.parse(markdown));
    return result;
  };

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
    // On Windows, path.join uses backslashes, so we check for 'docs' in the path
    expect(linkNode.url).toContain('docs');
  });

  it('should handle links without extension', async () => {
    const markdown = '[Link](./guide)';
    const result = await processMarkdown(markdown);

    const linkNode = result.children[0].children[0];
    expect(linkNode.url).toContain('guide');
  });
});
