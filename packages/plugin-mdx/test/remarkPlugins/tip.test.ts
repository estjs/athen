import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { remarkPluginTip } from '../../src/remarkPlugins/tip';
import { rewriteContainerTitles } from '../../src/pluginMdxRollup';

// Mirror the production pipeline: the `:::tip Title` shorthand is rewritten to a
// directive label before remark-directive parses it.
const processMarkdown = (markdown: string): Promise<any> => {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkPluginTip);
  return processor.run(processor.parse(rewriteContainerTitles(markdown)));
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

  it('should use the directive label as a custom title', async () => {
    const markdown = `:::tip Custom Title 
This is a tip with custom title
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.children[0].data.hProperties.class).toBe('at-directive-title');
    expect(directiveNode.children[0].children[0].value).toBe('Custom Title');
    // The label must not leak into the rendered content.
    expect(directiveNode.children[1].children[0].children[0].value).toBe(
      'This is a tip with custom title',
    );
  });

  it('should preserve inline formatting in a custom title', async () => {
    const markdown = `:::tip 自定义 \`标题\`
content
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');
    const titleChildren = directiveNode.children[0].children;

    expect(titleChildren[0].value).toBe('自定义 ');
    expect(titleChildren[1].type).toBe('inlineCode');
    expect(titleChildren[1].value).toBe('标题');
  });

  it('should still honor the legacy title attribute', async () => {
    const markdown = `:::tip{title="Legacy Title"}
This is a tip with a legacy title
:::`;
    const result = await processMarkdown(markdown);

    const directiveNode = result.children.find((node: any) => node.type === 'containerDirective');

    expect(directiveNode.children[0].children[0].value).toBe('Legacy Title');
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
