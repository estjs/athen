import path from 'node:path';
import { visit } from 'unist-util-visit';

import { isProduction, parseUrl } from '../utils';
import type { Plugin } from 'unified';

interface LinkNode {
  type: string;
  url?: string;
}

/**
 * Remark plugin to normalize a link href
 */
export const remarkPluginNormalizeLink: Plugin<[{ base: string; enableSpa: boolean }]> =
  ({ base, enableSpa }) =>
  (tree) => {
    visit(
      tree,
      (node: LinkNode) => node.type === 'link',
      (node: LinkNode) => {
        // Skip links we must not rewrite: in-page anchors, protocol-relative
        // (`//host`) URLs, and anything with an explicit scheme
        // (http:, https:, mailto:, tel:, …).
        if (
          !node.url ||
          node.url.startsWith('#') ||
          node.url.startsWith('//') ||
          /^[a-z][a-z0-9+.-]*:/i.test(node.url)
        ) {
          return;
        }

        let { url, hash } = parseUrl(node.url);
        const extname = path.extname(url);

        if (extname === '.md' || extname === '.mdx') {
          url = url.replace(extname, '');
        }

        if (isProduction() && !enableSpa && extname !== '.html') {
          url += '.html';
        }
        if (hash) {
          url += `#${hash}`;
        }
        node.url = path.join(base, url);
      },
    );
  };
