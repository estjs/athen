import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { remarkPluginTip } from '../../src/remarkPlugins/tip';

const processMarkdown = async (markdown: string) => {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkPluginTip);
  return await processor.run(processor.parse(markdown));
};

describe('remarkPluginTip', () => {
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
