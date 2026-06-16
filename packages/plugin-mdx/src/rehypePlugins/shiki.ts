import { visit } from 'unist-util-visit';
import { fromHtml } from 'hast-util-from-html';
import type { Plugin } from 'unified';
import type { Text } from 'hast';
import type { Highlighter } from 'shiki';

interface Options {
  highlighter: Highlighter;
  theme?: string;
}

function highlightSingleLine(line: number, fragmentAst: ReturnType<typeof fromHtml>) {
  // Children are composed of span and \n alternately, so we should get the even rows to highlight
  // @ts-expect-error The type problem of hast-util-from-html
  const codeLines = fragmentAst.children[0].children[0].children;
  const targetIndex = (line - 1) * 2;
  if (line < 1 || !codeLines?.length || targetIndex >= codeLines.length) return;
  codeLines[targetIndex].properties.className = 'line highlighted';
}

// https://github.com/leafac/rehype-shiki/blob/41e64054d72ab29d5ad48c4c070499fc075090e9/source/index.ts
// The plugin cannot be used directly because it won't reserve the class name `language-xxx` in the code tag
// It cause conflict with preWrapper plugin, so we should integrate it manually
export const rehypePluginShiki: Plugin<[Options], import('hast').Root> = ({
  highlighter,
  theme = 'dark-plus',
}) => {
  return async (tree) => {
    const codeBlocks: Array<{
      node: any;
      parent: any;
      codeContent: string;
      lang: string;
      highlightLines: number[];
    }> = [];

    visit(tree, 'element', (node, index, parent) => {
      // <pre><code>...</code></pre>
      if (
        node.tagName === 'pre' &&
        node.children?.[0]?.type === 'element' &&
        node.children[0].tagName === 'code'
      ) {
        const codeNode = node.children[0];

        // An empty fenced block (``` with no body) has no text child; default
        // to an empty string instead of dereferencing `undefined`.
        const codeContent = (codeNode.children[0] as Text | undefined)?.value ?? '';

        const codeClassName = codeNode.properties?.className?.toString() || '';

        // Capture the full language token (everything up to whitespace or the
        // `{1,3}` line-highlight marker) so names like `c++`, `objective-c` and
        // `c#` aren't truncated.
        const highlightLinesReg = /language-([^\s{]+)\s*(\{[\d,-]*\})?/i;
        const highlightRegExecResult = highlightLinesReg.exec(codeClassName);

        if (!highlightRegExecResult) {
          return;
        }

        const lang = highlightRegExecResult[1];
        if (!lang) {
          return;
        }

        // Support single line and line range
        const highlightLines: number[] = [];
        highlightRegExecResult[2]
          ?.slice(1, -1)
          ?.split(',')
          .forEach((str) => {
            const trimmed = str.trim();
            if (!trimmed) return;
            if (trimmed.includes('-')) {
              const [start, end] = trimmed.split('-');
              const startNum = Number(start);
              const endNum = Number(end);
              if (Number.isInteger(startNum) && Number.isInteger(endNum)) {
                for (let i = startNum; i <= endNum; i++) {
                  highlightLines.push(i);
                }
              }
            } else {
              const num = Number(trimmed);
              if (Number.isInteger(num)) {
                highlightLines.push(num);
              }
            }
          });

        codeBlocks.push({
          node,
          parent,
          codeContent,
          lang,
          highlightLines,
        });
      }
    });

    // Pre-load all unique languages in parallel
    const langsToLoad = Array.from(new Set(codeBlocks.map((cb) => cb.lang))).filter(
      (lang) => !highlighter.getLoadedLanguages().includes(lang),
    );

    if (langsToLoad.length > 0) {
      await Promise.all(
        langsToLoad.map(async (lang) => {
          try {
            await highlighter.loadLanguage(lang as any);
          } catch (error) {
            console.warn(`[shiki] Failed to load language: ${lang}`, error);
          }
        }),
      );
    }

    for (const { node, parent, codeContent, lang, highlightLines } of codeBlocks) {
      const highlightedCode = highlighter.codeToHtml(codeContent, {
        lang,
        theme,
      });

      const fragmentAst = fromHtml(highlightedCode, { fragment: true });

      // @ts-expect-error
      fragmentAst.children[0].children[0].properties.className = `language-${lang}`;

      highlightLines.forEach((line) => highlightSingleLine(line, fragmentAst));

      if (parent) {
        const idx = parent.children.indexOf(node);
        if (idx !== -1) {
          parent.children.splice(idx, 1, ...fragmentAst.children);
        }
      }
    }
  };
};
