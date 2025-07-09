import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return tree => {
    visit(tree, 'element', node => {
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element' &&
        node.children[0].tagName === 'code' &&
        !(node.data as any)?.isVisited
      ) {
        const codeNode = node.children[0];
        const codeClassName = codeNode.properties?.className?.toString() || '';
        const lang = codeClassName.split('-')[1];
        if (!codeClassName || !lang) {
          return;
        }

        const clonedNode = {
          type: 'element',
          tagName: 'pre',
          children: node.children,
          data: {
            isVisited: true,
          },
        } as unknown as Element;

        node.tagName = 'div';
        node.properties = node.properties || {};
        node.properties.className = codeClassName;

        node.children = [
          {
            type: 'element',
            tagName: 'button',
            properties: {
              className: 'copy',
            },
            children: [
              {
                type: 'text',
                value: '',
              },
            ],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: {
              className: 'lang',
            },
            children: [
              {
                type: 'text',
                value: lang,
              },
            ],
          },
          clonedNode,
        ];
      }
    });
  };
};
