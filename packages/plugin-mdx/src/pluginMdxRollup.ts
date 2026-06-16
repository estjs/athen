import { compile } from '@mdx-js/mdx';
import { SourceMapGenerator } from 'source-map';
import remarkPluginGFM from 'remark-gfm';
import remarkPluginFrontMatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkPluginMDXFrontMatter from 'remark-mdx-frontmatter';
import remarkGemoji from 'remark-gemoji';
import rehypePluginAutolinkHeadings from 'rehype-autolink-headings';
import rehypePluginSlug from 'rehype-slug';
import rehypePluginExternalLinks from 'rehype-external-links';
import { bundledLanguages, createHighlighter } from 'shiki';
import { remarkPluginToc } from './remarkPlugins/toc';
import { remarkPluginTip } from './remarkPlugins/tip';
import { rehypePluginShiki } from './rehypePlugins/shiki';
import { remarkPluginNormalizeLink } from './remarkPlugins/link';
import { rehypePluginPreWrapper } from './rehypePlugins/preWrapper';
import { MD_EXTENSIONS, TARGET_BLANK_WHITE_LIST, cleanUrl, isReg } from './utils';
import type { options } from './types';
import type { Plugin } from 'vite';
import type { PluggableList } from 'unified';

const MD_FILTER = new RegExp(`\\.(?:${MD_EXTENSIONS.join('|')})(?:$|\\?)`);
const MDX_FILTER = new RegExp(`\\.(?:${MD_EXTENSIONS.join('|')}|mdx)(?:$|\\?)`);
const ESCAPE_PLACEHOLDER = '__HTMLESC';

const highlighterPromises = new Map<string, ReturnType<typeof createHighlighter>>();

function resolveShikiThemes(config: options): {
  themes: string[];
  active: string;
} {
  const configured = [...(config.shiki?.themes || [])];
  const requested = config.shiki?.theme;
  if (requested && !configured.includes(requested)) configured.unshift(requested);
  const themes = configured.length ? configured : ['dark-plus'];
  return {
    themes,
    active: requested && themes.includes(requested) ? requested : themes[0],
  };
}

function getShikiHighlighter(themes: string[]) {
  const key = themes.join('\0');
  let promise = highlighterPromises.get(key);
  if (!promise) {
    promise = createHighlighter({
      themes,
      langs: Object.keys(bundledLanguages),
    });
    highlighterPromises.set(key, promise);
  }
  return promise;
}

function createExternalLinksPlugin(config: options) {
  if (config.externalLinks === false) return null;
  const { target, rel } = config.externalLinks || {};
  const fallback = target ?? '_blank';
  return [
    rehypePluginExternalLinks,
    {
      target: (node: any) => {
        const href = node.properties?.href;
        if (typeof href !== 'string') return fallback;
        const matched = TARGET_BLANK_WHITE_LIST.some((item) =>
          isReg(item) ? item.test(href) : href.startsWith(item),
        );
        return matched ? '_self' : fallback;
      },
      rel,
    },
  ];
}

function createTocPlugin(config: options) {
  if (config.toc === false) return [remarkPluginToc, { enabled: false }];
  if (config.toc && typeof config.toc === 'object') return [remarkPluginToc, config.toc];
  return remarkPluginToc;
}

function stash(placeholders: string[], value: string) {
  placeholders.push(value);
  return `${ESCAPE_PLACEHOLDER}${placeholders.length - 1}__`;
}

function restore(source: string, placeholders: string[]) {
  return source.replaceAll(
    /__HTMLESC(\d+)__/g,
    (_m, idx) => placeholders[Number.parseInt(idx, 10)],
  );
}

function protectFencedCodeBlocks(source: string, placeholders: string[]) {
  const out: string[] = [];
  let fence: {
    marker: '`' | '~';
    length: number;
    indent: string;
    lines: string[];
  } | null = null;

  for (const line of source.split('\n')) {
    if (fence) {
      fence.lines.push(line);
      if (new RegExp(`^${fence.indent}${fence.marker}{${fence.length},}\\s*$`).test(line)) {
        out.push(stash(placeholders, fence.lines.join('\n')));
        fence = null;
      }
      continue;
    }
    const open = line.match(/^( {0,3})(`{3,}|~{3,})/);
    if (!open) {
      out.push(line);
      continue;
    }
    fence = {
      marker: open[2][0] as '`' | '~',
      length: open[2].length,
      indent: open[1],
      lines: [line],
    };
  }

  if (fence) out.push(...fence.lines);
  return out.join('\n');
}

// Rewrite the `:::tip Custom Title` shorthand into the directive label syntax
// remark-directive understands (`:::tip[Custom Title]`); without it the trailing
// text makes the whole block fail to parse. Fenced code blocks are protected so
// example snippets render literally.
export function rewriteContainerTitles(source: string): string {
  const placeholders: string[] = [];
  const result = protectFencedCodeBlocks(source, placeholders).replaceAll(
    /^( {0,3}:{3,}[a-z][\w-]*)[ \t]+(?!\[)(\S.*)$/gim,
    (_m, head, title) => `${head}[${title.trimEnd()}]`,
  );
  return restore(result, placeholders);
}

// Escape `<` that starts an HTML/JSX tag in Markdown prose, so MDX does not
// interpret it as a JSX element. Inline code spans AND fenced code blocks are
// passed through untouched — MDX/Shiki produce JSX text nodes for their
// contents, and Essor's SSR renderer HTML-escapes those at render time.
export function escapeHtmlTags(source: string, id?: string): string {
  if (id && !MD_FILTER.test(cleanUrl(id))) return source;

  const placeholders: string[] = [];
  let result = protectFencedCodeBlocks(source, placeholders);
  result = result.replaceAll(/(`+)([^`]+)\1/g, (match) => stash(placeholders, match));
  result = result.replaceAll(/<(\/?)([a-z])/g, '&lt;$1$2');
  return restore(result, placeholders);
}

export async function pluginMdxRollup(config?: options): Promise<Plugin[]> {
  config = config || ({} as options);
  const { themes, active } = resolveShikiThemes(config);
  const externalLinksPlugin = createExternalLinksPlugin(config);

  const remarkPlugins: PluggableList = [
    remarkPluginGFM,
    remarkPluginFrontMatter,
    [remarkPluginMDXFrontMatter, { name: 'frontmatter' }],
    remarkGemoji,
    createTocPlugin(config) as never,
    remarkDirective,
    remarkPluginTip,
    [remarkPluginNormalizeLink, { base: config.base || '/', enableSpa: config.enableSpa }],
    ...(config.remarkPlugins || []),
  ];

  const rehypePlugins: PluggableList = [
    rehypePluginSlug,
    [
      rehypePluginAutolinkHeadings,
      {
        properties: { class: 'header-anchor', ariaHidden: 'true' },
        content: { type: 'text', value: '#' },
      },
    ],
    ...(externalLinksPlugin ? [externalLinksPlugin as never] : []),
    [rehypePluginPreWrapper, { lineNumbers: config.lineNumbers }],
    [rehypePluginShiki, { highlighter: await getShikiHighlighter(themes), theme: active }],
    ...(config.rehypePlugins || []),
  ];

  const mdxOptions = {
    SourceMapGenerator,
    elementAttributeNameCase: 'html' as const,
    jsx: true,
    mdExtensions: MD_EXTENSIONS.map((ext) => `.${ext}`),
    mdxExtensions: ['.mdx'],
    remarkPlugins,
    rehypePlugins,
    development: false,
  };

  return [
    {
      name: 'athen:mdx-escape-html',
      enforce: 'pre',
      transform: {
        filter: { id: MD_FILTER },
        handler(code, id) {
          return { code: escapeHtmlTags(code, id), map: null };
        },
      },
    },
    {
      name: 'athen:mdx-rolldown',
      config(_config, env) {
        mdxOptions.development = env.mode === 'development';
      },
      transform: {
        filter: { id: MDX_FILTER },
        async handler(code, id) {
          const [path] = id.split('?');
          const compiled = await compile({ path, value: rewriteContainerTitles(code) }, mdxOptions);
          return {
            code: String(compiled.value),
            map: compiled.map,
            moduleType: 'js',
          };
        },
      },
    },
  ];
}
