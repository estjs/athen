import { defineConfig } from 'athen';

export default defineConfig({
  title: 'Basic Example',
  description: 'One compact example for shallow config, Markdown options, URLs, and links.',
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
  },
  themeConfig: {
    nav: [
      { text: 'Start', link: '/guide/start/' },
      { text: 'Markdown', link: '/guide/markdown/' },
      { text: 'Links', link: '/guide/valid/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Basic',
          items: [
            { text: 'Start', link: '/guide/start/' },
            { text: 'Markdown', link: '/guide/markdown/' },
            { text: 'Valid Links', link: '/guide/valid/' },
          ],
        },
      ],
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Basic example footer',
    },
  },
});
