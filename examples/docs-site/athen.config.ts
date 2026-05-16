import { defineConfig } from 'athen';

export default defineConfig({
  title: 'Docs Site Example',
  description: 'Custom home, auto sidebar, and three-language i18n in one example.',
  defaultLocale: 'en',
  exclude: ['components/**'],
  locales: {
    '/': {
      label: 'English',
      lang: 'en-US',
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/config' },
      ],
      sidebar: 'auto',
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh-CN',
      nav: [{ text: '指南', link: '/zh/guide/' }],
      sidebar: 'auto',
      outlineTitle: '目录',
      prevPageText: '上一页',
      nextPageText: '下一页',
    },
    '/fr/': {
      label: 'Français',
      lang: 'fr-FR',
      nav: [{ text: 'Guide', link: '/fr/guide/' }],
      sidebar: 'auto',
      outlineTitle: 'Sur cette page',
      prevPageText: 'Page precedente',
      nextPageText: 'Page suivante',
    },
  },
  themeConfig: {
    sidebar: 'auto',
    footer: {
      message: 'Athen docs-site example',
      copyright: 'MIT License',
    },
  },
});
