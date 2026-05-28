import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { remarkPluginToc } from '../../src/remarkPlugins/toc';

const processMarkdown = async (
  markdown: string,
  tocOptions?: Parameters<typeof remarkPluginToc>[0],
) => {
  const processor = unified().use(remarkParse).use(remarkPluginToc, tocOptions);
  return await processor.run(processor.parse(markdown));
};

describe('remarkPluginToc', () => {
  it('should extract h2-h4 headings into toc', async () => {
    const markdown = `# Title

## Section 1

### Subsection 1.1

## Section 2

#### Deep Section
`;
    const result = await processMarkdown(markdown);

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
    const result = await processMarkdown('');

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

  it('should respect configured toc heading levels', async () => {
    const markdown = `# Title

## Level 2

### Level 3

#### Level 4
`;
    const result = await processMarkdown(markdown, { level: [3, 4] });

    const tocNode = result.children.find(
      (node: any) => node.type === 'mdxjsEsm' && node.value?.includes('export const toc'),
    );

    expect(tocNode.value).not.toContain('Level 2');
    expect(tocNode.value).toContain('Level 3');
    expect(tocNode.value).toContain('Level 4');
  });
});
