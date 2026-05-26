/**
 * Self-contained remark plugin — zero external dependencies.
 *
 * Walks the MDAST and tags every `txt`-lang fenced code block with
 * `label="Executable"` so the rendered output shows a labelled code
 * frame. Any other language is left alone.
 *
 * Wire it in athen.config.ts:
 * ```ts
 * import { remarkLabelTxt } from './guide/remarkPlugin';
 * // inside defineConfig({ markdown: { remarkPlugins: [remarkLabelTxt] } })
 * ```
 */

interface CodeNode {
  type: string;
  lang?: string;
  meta?: string | null;
  children?: unknown[];
}

function walk(node: unknown) {
  const n = node as CodeNode;
  if (n.type === 'code' && n.lang === 'txt') {
    n.meta = n.meta ? `${n.meta} label="Executable"` : 'label="Executable"';
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) walk(child);
  }
}

export function remarkLabelTxt() {
  return walk;
}
