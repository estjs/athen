import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return tree => {
    visit(tree, 'element', node => {
      // <pre><code class="language-js">...</code></pre> => <div class="language-js"><span class="lang"></span><pre><code class="language-js">...</code></pre></div>
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element' &&
        node.children[0].tagName === 'code' &&
        (!node.data as any)?.isVisited
      ) {
        // console.log("tagName=====>", node);
        const codeNode = node.children[0];
        const codeClassName = codeNode.properties?.className?.toString() || '';
        // language-xxx
        const lang = codeClassName.split('-')[1];

        codeNode.properties.className = '';

        const clonedNode = {
          type: 'element',
          tagName: 'pre',
          children: node.children,
          data: {
            isVisited: true,
          },
        } as unknown as Element;

        // 修改原来的 pre 标签 -> div 标签
        node.tagName = 'div';
        node.properties = node.properties || {};
        node.properties.className = codeClassName;

        node.children = [
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
