import { defineConfig } from 'athen';
import { remarkLabelTxt } from './guide/remarkPlugin';

export default defineConfig({
  title: 'Basic Example',
  description: 'Self-contained demo — custom remark plugin, _meta.json sidebar, Essor components.',
  lang: 'en-US',
  base: '/',
  cleanUrls: true,
  trailingSlash: true,
  rewrites: {
    '/old-start': '/guide/start',
  },
  onBrokenLinks: 'throw',

  markdown: {
    lineNumbers: true,
    toc: {
      level: [2, 3],
    },
    externalLinks: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    shiki: {
      theme: 'github-dark',
    },
    // Prepended to Athen's built-in MDX pipeline. The plugin is defined
    // locally in guide/remarkPlugin.ts, no npm install needed.
    remarkPlugins: [remarkLabelTxt],
  },

  themeConfig: {
    nav: [
      { text: 'Start', link: '/guide/start/' },
      { text: 'Markdown', link: '/guide/markdown/' },
      { text: 'Essor Demo', link: '/guide/essor-demo/' },
      { text: 'Links', link: '/guide/valid/' },
    ],
    // 'auto' sidebar reads _meta.json from each folder for ordering.
    sidebar: 'auto',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Basic example — remark plugin + _meta.json + Essor',
    },
  },
});
