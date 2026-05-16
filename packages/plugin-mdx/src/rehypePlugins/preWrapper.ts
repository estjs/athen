import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root, Text } from 'hast';

interface Options {
  lineNumbers?: boolean;
}

function stringifyClassName(className: unknown) {
  return Array.isArray(className) ? className.join(' ') : className?.toString() || '';
}

function getLanguageFromClassName(className: string) {
  return /\blanguage-(\S+)/.exec(className)?.[1];
}

function getCodeText(codeNode: Element) {
  return codeNode.children
    .map((child) => (child.type === 'text' ? (child as Text).value : ''))
    .join('');
}

function countCodeLines(code: string) {
  const normalizedCode = code.endsWith('\n') ? code.slice(0, -1) : code;
  return normalizedCode ? normalizedCode.split('\n').length : 1;
}

function createLineNumbersWrapper(lineCount: number): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: 'line-numbers-wrapper',
    },
    children: Array.from({ length: lineCount }, (_, index) => ({
      type: 'element',
      tagName: 'span',
      properties: {},
      children: [
        {
          type: 'text',
          value: String(index + 1),
        },
      ],
    })),
  };
}

export const rehypePluginPreWrapper: Plugin<[Options?], Root> = (options = {}) => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element' &&
        node.children[0].tagName === 'code' &&
        !(node.data as any)?.isVisited
      ) {
        const codeNode = node.children[0];
        const codeClassName = stringifyClassName(codeNode.properties?.className);
        const lang = getLanguageFromClassName(codeClassName);
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
        node.properties.className = options.lineNumbers
          ? `${codeClassName} line-numbers-mode`
          : codeClassName;

        const children: Element['children'] = [
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

        if (options.lineNumbers) {
          children.splice(2, 0, createLineNumbersWrapper(countCodeLines(getCodeText(codeNode))));
        }

        node.children = children;
      }
    });
  };
};
