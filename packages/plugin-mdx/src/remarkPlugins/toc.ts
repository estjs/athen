import { visitChildren } from 'unist-util-visit-children';
import { parse } from 'acorn';
import Slugger from 'github-slugger';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm';

const slugger = new Slugger();

interface TocItem {
  id: string;
  text: string;
  depth: number;
}

interface TocOptions {
  level?: [number, number];
  enabled?: boolean;
}

interface ChildNode {
  type: 'link' | 'text' | 'inlineCode' | 'emphasis' | 'strong';
  value: string;
  children?: ChildNode[];
}

interface Heading {
  type: string;
  depth?: number;
  children?: ChildNode[];
}

type MdxProgram = NonNullable<NonNullable<MdxjsEsm['data']>['estree']>;

/** Flatten a heading's inline children into plain text (mirrors rehype-slug input). */
function headingText(children: ChildNode[]): string {
  return children
    .map((child: ChildNode) => {
      switch (child.type) {
        // child with value
        case 'text':
        case 'inlineCode':
          return child.value;

        // child without value, but can get value from children property
        case 'emphasis':
        case 'strong':
        case 'link':
          return child.children?.map((c) => c.value).join('') || '';

        // child without value and can not get value from children property
        default:
          return '';
      }
    })
    .join('');
}

export const remarkPluginToc: Plugin<[TocOptions?], Root> = (options = {}) => {
  return (tree: Root) => {
    const toc: TocItem[] = [];
    let title = '';
    const [minLevel, maxLevel] = options.level ?? [2, 4];
    slugger.reset();
    visitChildren((node: Heading) => {
      if (node.type !== 'heading' || !node.depth || !node.children) {
        return;
      }
      // Collect h2 ~ h5
      if (node.depth === 1) {
        title = headingText(node.children);
      }

      if (options.enabled !== false && node.depth >= minLevel && node.depth <= maxLevel) {
        const originText = headingText(node.children);
        const id = slugger.slug(originText);
        const depth = node.depth;
        toc.push({ id, text: originText, depth });
      }
    })(tree);
    const createMdxExport = (value: string): MdxjsEsm => ({
      type: 'mdxjsEsm',
      value,
      data: {
        estree: parse(value, {
          ecmaVersion: 2020,
          sourceType: 'module',
        }) as unknown as MdxProgram,
      },
    });

    // Add toc ast to current ast tree
    tree.children.push(createMdxExport(`export const toc = ${JSON.stringify(toc, null, 2)}`));

    if (title) {
      tree.children.push(createMdxExport(`export const title = ${JSON.stringify(title)}`));
    }
  };
};
