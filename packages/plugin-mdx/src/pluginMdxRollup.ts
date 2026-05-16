import pluginMdx from '@mdx-js/rollup';
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
import { TARGET_BLANK_WHITE_LIST, isReg } from './utils';
import type { options } from './types';
import type { Plugin } from 'vite';
import type { PluggableList } from 'unified';

const highlighterPromises = new Map<string, ReturnType<typeof createHighlighter>>();

function getShikiThemes(config: options) {
  const themes = [...(config.shiki?.themes || [])];
  const activeTheme = config.shiki?.theme;
  if (activeTheme && !themes.includes(activeTheme)) {
    themes.unshift(activeTheme);
  }
  return themes.length ? themes : ['dark-plus'];
}

function getActiveShikiTheme(config: options, themes: string[]) {
  const activeTheme = config.shiki?.theme;
  return activeTheme && themes.includes(activeTheme) ? activeTheme : themes[0];
}

function getShikiHighlighter(themes: string[]) {
  const cacheKey = themes.join('\0');
  let highlighterPromise = highlighterPromises.get(cacheKey);
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes,
      langs: Object.keys(bundledLanguages),
    });
    highlighterPromises.set(cacheKey, highlighterPromise);
  }
  return highlighterPromise;
}

function createExternalLinksPlugin(config: options) {
  if (config.externalLinks === false) {
    return null;
  }

  const externalLinks = config.externalLinks || {};
  return [
    rehypePluginExternalLinks,
    {
      target: (node: any) => {
        const href = node.properties?.href;
        const whiteList = [...TARGET_BLANK_WHITE_LIST];
        if (typeof href === 'string') {
          const inWhiteList = whiteList.some((item) => {
            if (isReg(item)) return item.test(href);
            return href.startsWith(item);
          });
          if (inWhiteList) return '_self';
        }
        return externalLinks.target ?? '_blank';
      },
      rel: externalLinks.rel,
    },
  ];
}

function createTocPlugin(config: options) {
  if (config.toc === false) {
    return [remarkPluginToc, { enabled: false }];
  }
  if (config.toc && typeof config.toc === 'object') {
    return [remarkPluginToc, config.toc];
  }
  return remarkPluginToc;
}

export async function pluginMdxRollup(config: options): Promise<Plugin> {
  config = config || {};
  const shikiThemes = getShikiThemes(config);
  const shikiTheme = getActiveShikiTheme(config, shikiThemes);
  const externalLinksPlugin = createExternalLinksPlugin(config);

  const remarkPlugins: PluggableList = [
    remarkPluginGFM,
    // The following two plugin for frontmatter
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
        properties: {
          class: 'header-anchor',
          ariaHidden: 'true',
        },
        content: {
          type: 'text',
          value: '#',
        },
      },
    ],
  ];

  if (externalLinksPlugin) {
    rehypePlugins.push(externalLinksPlugin as never);
  }
  rehypePlugins.push(
    [rehypePluginPreWrapper, { lineNumbers: config.lineNumbers }],
    [
      rehypePluginShiki,
      {
        highlighter: await getShikiHighlighter(shikiThemes),
        theme: shikiTheme,
      },
    ],
    ...(config.rehypePlugins || []),
  );

  return pluginMdx({
    elementAttributeNameCase: 'html',
    jsx: true,
    remarkPlugins,
    rehypePlugins,
  }) as unknown as Plugin;
}
