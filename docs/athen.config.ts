import { defineConfig } from 'athen';
import pkg from '../package.json';

export default defineConfig({
  title: 'Athen',
  description: 'Vite + Essor documentation framework',
  lang: 'en-US',
  favicon: '/logo.png',
  onBrokenLinks: 'throw',

  defaultLocale: 'en',
  locales: {
    '/': {
      label: 'English',
      lang: 'en',
      nav: [
        { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
        { text: 'API', link: '/api/', activeMatch: '/api/' },
        {
          text: `v${pkg.version}`,
          items: [
            {
              text: 'Changelog',
              link: 'https://github.com/estjs/athen/blob/master/CHANGELOG.md',
            },
          ],
        },
      ],
      lastUpdatedText: 'Last Updated',
      outlineTitle: 'ON THIS PAGE',
      editLink: 'https://github.com/estjs/athen/tree/master/docs/:path',
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh',
      nav: [
        { text: '指南', link: '/zh/guide/getting-started', activeMatch: '/guide/' },
        { text: 'API', link: '/zh/api/', activeMatch: '/api/' },
        {
          text: `v${pkg.version}`,
          items: [
            {
              text: '更新日志',
              link: 'https://github.com/estjs/athen/blob/master/CHANGELOG.md',
            },
          ],
        },
      ],
      lastUpdatedText: '上次更新',
      editLink: 'https://github.com/estjs/athen/tree/master/docs/:path',
      outlineTitle: '本页内容',
    },
  },

  socialLinks: [
    { icon: 'github', link: 'https://github.com/estjs/athen', ariaLabel: 'GitHub' },
    { icon: 'discord', link: 'https://discord.gg', ariaLabel: 'Discord' },
  ],
  footer: {
    message: 'Released under the MIT License.',
    copyright: 'Copyright © 2023-present estjs',
  },

  markdown: {
    shiki: { theme: 'dark-plus' },
  },

  search: {
    provider: 'flex',
    include: ['**/*.md', '**/*.mdx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    searchOptions: { limit: 10, enrich: true, suggest: true },
  },
});
