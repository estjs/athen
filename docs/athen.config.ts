import { defineConfig } from 'athen';

export default defineConfig({
  lang: 'en-US',
  title: 'Athen',
  icon: '/logo.png',

  // 启用本地搜索
  search: {
    provider: 'flex',
    include: ['**/*.md', '**/*.mdx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    searchOptions: {
      limit: 10,
      enrich: true,
      suggest: true,
    },
  },

  themeConfig: {
    locales: {
      '/zh/': {
        lang: 'zh',
        label: '简体中文',
        lastUpdatedText: '上次更新',
        nav: [
          {
            text: '指南',
            link: '/zh/guide/getting-started',
            activeMatch: '/guide/',
          },
          {
            text: 'API',
            link: '/zh/api/',
            activeMatch: '/api/',
          },
          {
            text: 'v0.0.0',
            items: [
              {
                text: '更新日志',
                link: 'https://github.com/estjs/athen/blob/master/CHANGELOG.md',
              },
            ],
          },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '介绍',
              items: [
                {
                  text: '快速开始',
                  link: '/zh/guide/getting-started',
                },
                {
                  text: '配置站点',
                  link: '/zh/guide/configure-site',
                },
              ],
            },
            {
              text: '基础功能',
              items: [
                {
                  text: '约定式路由',
                  link: '/zh/guide/conventional-route',
                },
                {
                  text: '使用 MDX 语法',
                  link: '/zh/guide/use-mdx',
                },
                {
                  text: '静态资源',
                  link: '/zh/guide/static-assets',
                },
                {
                  text: '多实例站点',
                  link: '/zh/guide/multi-instance',
                },
                {
                  text: '插件系统',
                  link: '/zh/guide/plugin-system',
                },
                {
                  text: '自定义样式',
                  link: '/zh/guide/custom-styling',
                },
              ],
            },
            {
              text: '默认主题功能',
              items: [
                {
                  text: 'Home 主页',
                  link: '/zh/guide/home-page',
                },
                {
                  text: 'API 预览页',
                  link: '/zh/guide/api-page',
                },
                {
                  text: '正文页面',
                  link: '/zh/guide/doc-page',
                },
                {
                  text: '国际化',
                  link: '/zh/guide/i18n',
                },
                {
                  text: '全文搜索',
                  link: '/zh/guide/search',
                },
                {
                  text: '分析统计',
                  link: '/zh/guide/analytics',
                },
                {
                  text: '主题包系统',
                  link: '/zh/guide/theme-package',
                },
              ],
            },
          ],
          '/zh/api/': [
            {
              text: '配置项',
              items: [
                {
                  text: '基础配置',
                  link: '/zh/api/config-basic',
                },
                {
                  text: '主题配置',
                  link: '/zh/api/config-theme',
                },
                {
                  text: 'Front Matter 配置',
                  link: '/zh/api/config-front-matter',
                },
              ],
            },
            {
              text: 'Client API',
              items: [
                {
                  text: '运行时 API',
                  link: '/zh/api/api-runtime',
                },
              ],
            },
            {
              text: 'CLI 工具',
              items: [
                {
                  text: '命令参考',
                  link: '/zh/api/cli',
                },
              ],
            },
          ],
        },
        title: 'Athen',
        outlineTitle: '目录',
        prevPageText: '上一页',
        nextPageText: '下一页',
        description: '',
        editLink: {
          pattern: 'https://github.com/estjs/athen/tree/master/docs/:path',
          text: '📝 在 GitHub 上编辑此页',
        },
      },
      '/en/': {
        lang: 'en',
        label: 'English',
        lastUpdated: 'Last Updated',
        nav: [
          {
            text: 'Guide',
            link: '/en/guide/getting-started',
            activeMatch: '/guide/',
          },
          {
            text: 'API',
            link: '/en/api/',
            activeMatch: '/api/',
          },
          {
            text: 'v0.0.0',
            items: [
              {
                text: 'Changelog',
                link: 'https://github.com/estjs/athen/blob/master/CHANGELOG.md',
              },
            ],
          },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                {
                  text: 'Getting Started',
                  link: '/en/guide/getting-started',
                },
                {
                  text: 'Configure Your Site',
                  link: '/en/guide/configure-site',
                },
              ],
            },
            {
              text: 'Features',
              items: [
                {
                  text: 'Conventional Routing',
                  link: '/en/guide/conventional-route',
                },
                {
                  text: 'Using MDX',
                  link: '/en/guide/use-mdx',
                },
                {
                  text: 'Static Assets',
                  link: '/en/guide/static-assets',
                },
                {
                  text: 'Multi-Instance Sites',
                  link: '/en/guide/multi-instance',
                },
                {
                  text: 'Plugin System',
                  link: '/en/guide/plugin-system',
                },
                {
                  text: 'Custom Styling',
                  link: '/en/guide/custom-styling',
                },
              ],
            },
            {
              text: 'Default Theme',
              items: [
                {
                  text: 'Home Page',
                  link: '/en/guide/home-page',
                },
                {
                  text: 'API Page',
                  link: '/en/guide/api-page',
                },
                {
                  text: 'Doc Page',
                  link: '/en/guide/doc-page',
                },
                {
                  text: 'I18n',
                  link: '/en/guide/i18n',
                },
                {
                  text: 'Search',
                  link: '/en/guide/search',
                },
                {
                  text: 'Analytics',
                  link: '/en/guide/analytics',
                },
                {
                  text: 'Theme Package',
                  link: '/en/guide/theme-package',
                },
              ],
            },
          ],
          '/en/api/': [
            {
              text: 'Config',
              items: [
                {
                  text: 'Basic Config',
                  link: '/en/api/config-basic',
                },
                {
                  text: 'Theme Config',
                  link: '/en/api/config-theme',
                },
                {
                  text: 'Front Matter Config',
                  link: '/en/api/config-front-matter',
                },
              ],
            },
            {
              text: 'Client API',
              items: [
                {
                  text: 'Runtime API',
                  link: '/en/api/api-runtime',
                },
              ],
            },
            {
              text: 'CLI Tool',
              items: [
                {
                  text: 'CLI Reference',
                  link: '/en/api/cli',
                },
              ],
            },
          ],
        },
        title: 'Athen',
        description: '',
        lastUpdatedText: 'Last Updated',
        editLink: {
          pattern: 'https://github.com/estjs/athen/tree/master/docs/:path',
          text: '📝 Edit this page on GitHub',
        },
      },
    },
    outlineTitle: 'ON THIS PAGE',
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/estjs/athen',
      },
      {
        icon: 'discord',
        mode: 'link',
        content: 'https://discord.gg',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present estjs',
    },
  },
});
