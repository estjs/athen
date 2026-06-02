import { visit } from 'unist-util-visit';
import { DIRECTIVE_TYPES } from '../utils';
import type { Node, Root } from 'mdast';
import type { Plugin } from 'unified';

interface DirectiveChild {
  type: string;
  data?: { directiveLabel?: boolean };
  children?: Node[];
}

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: {
    title?: string;
  };
  data?: unknown;
  children?: DirectiveChild[];
}

interface InitialData {
  hName?: string;
  hProperties?: Record<string, string>;
}

export const remarkPluginTip: Plugin<[], Root> = () => {
  return (tree: Root) => {
    //@ts-expect-error
    visit(tree, (node: DirectiveNode) => {
      if (node.type !== 'containerDirective' || !node.name) {
        return;
      }
      const name = DIRECTIVE_TYPES.includes(node.name) ? node.name : DIRECTIVE_TYPES[0];
      const children = node.children || [];
      const label = children.find((child) => child.data?.directiveLabel);

      // Title: a directive label (`:::tip[Title]` / `:::tip Title`) keeps its
      // inline formatting; otherwise the `{title="..."}` attribute, then the name.
      const title = label?.children ?? [
        { type: 'text', value: node.attributes?.title ?? name.toLocaleUpperCase() },
      ];
      const content = label ? children.filter((child) => child !== label) : children;

      const data: InitialData = node.data ?? (node.data = {});
      data.hName = 'div';
      data.hProperties = { class: `at-directive ${name}` };

      node.children = [
        {
          type: 'paragraph',
          data: { hProperties: { class: 'at-directive-title' } },
          children: title,
        },
        {
          type: 'element',
          data: { hProperties: { class: 'at-directive-content' } },
          children: content,
        },
      ] as unknown as DirectiveChild[];
    });
  };
};
