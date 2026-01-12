import { defineConfig } from 'athen';

export default defineConfig({
  lang: 'en-US',
  title: 'My Athen Site',
  description: 'A documentation site built with Athen',
  icon: '/logo.svg',
  base: '/',

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

  // 启用分析统计（可选）
  // analytics: {
  //   google: 'G-XXXXXXXXXX',
  // },

  // 启用颜色主题切换
  colorScheme: true,

  // 自定义头部标签
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'keywords', content: 'documentation, athen, static site generator' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'My Athen Site' }],
    ['meta', { property: 'og:description', content: 'A documentation site built with Athen' }],
  ],

  themeConfig: {
    // 多语言配置
    locales: {
      '/': {
        lang: 'en-US',
        label: 'English',
        title: 'My Athen Site',
        description: 'A documentation site built with Athen',
        
        // 导航栏配置
        nav: [
          { text: 'Home', link: '/' },
          { 
            text: 'Guide', 
            link: '/guide/getting-started',
            activeMatch: '/guide/'
          },
          { 
            text: 'API', 
            link: '/api/introduction',
            activeMatch: '/api/'
          },
          {
            text: 'Examples',
            items: [
              { text: 'Basic Usage', link: '/examples/basic' },
              { text: 'Advanced Features', link: '/examples/advanced' },
              { text: 'Custom Theme', link: '/examples/custom-theme' },
            ]
          },
          {
            text: 'v1.0.0',
            items: [
              { text: 'Changelog', link: '/changelog' },
              { text: 'Contributing', link: '/contributing' },
              { text: 'GitHub', link: 'https://github.com/your-org/your-repo' },
            ]
          }
        ],

        // 侧边栏配置
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/introduction' },
                { text: 'Quick Start', link: '/guide/getting-started' },
                { text: 'Installation', link: '/guide/installation' },
                { text: 'Configuration', link: '/guide/configuration' },
              ]
            },
            {
              text: 'Features',
              items: [
                { text: 'Markdown Support', link: '/guide/markdown' },
                { text: 'MDX Components', link: '/guide/mdx-components' },
                { text: 'Static Assets', link: '/guide/static-assets' },
                { text: 'Routing', link: '/guide/routing' },
                { text: 'Search', link: '/guide/search' },
                { text: 'Internationalization', link: '/guide/i18n' },
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Custom Theme', link: '/guide/custom-theme' },
                { text: 'Plugin Development', link: '/guide/plugin-development' },
                { text: 'Deployment', link: '/guide/deployment' },
              ]
            }
          ],
          '/api/': [
            {
              text: 'Configuration',
              items: [
                { text: 'Introduction', link: '/api/introduction' },
                { text: 'Site Config', link: '/api/site-config' },
                { text: 'Theme Config', link: '/api/theme-config' },
                { text: 'Frontmatter', link: '/api/frontmatter' },
              ]
            },
            {
              text: 'Runtime API',
              items: [
                { text: 'Client API', link: '/api/client-api' },
                { text: 'Node API', link: '/api/node-api' },
                { text: 'Plugin API', link: '/api/plugin-api' },
              ]
            }
          ],
          '/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'Basic Usage', link: '/examples/basic' },
                { text: 'Advanced Features', link: '/examples/advanced' },
                { text: 'Custom Theme', link: '/examples/custom-theme' },
              ]
            }
          ]
        },

        // 编辑链接
        editLink: {
          pattern: 'https://github.com/your-org/your-repo/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        },

        // 页脚配置
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024-present Your Name'
        },

        // 其他文本配置
        lastUpdatedText: 'Last Updated',
        outlineTitle: 'On This Page',
        returnToTopLabel: 'Return to Top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Dark Mode',
      },

      '/zh/': {
        lang: 'zh-CN',
        label: '简体中文',
        title: '我的 Athen 站点',
        description: '使用 Athen 构建的文档站点',
        
        // 导航栏配置
        nav: [
          { text: '首页', link: '/zh/' },
          { 
            text: '指南', 
            link: '/zh/guide/getting-started',
            activeMatch: '/zh/guide/'
          },
          { 
            text: 'API', 
            link: '/zh/api/introduction',
            activeMatch: '/zh/api/'
          },
          {
            text: '示例',
            items: [
              { text: '基础用法', link: '/zh/examples/basic' },
              { text: '高级功能', link: '/zh/examples/advanced' },
              { text: '自定义主题', link: '/zh/examples/custom-theme' },
            ]
          },
          {
            text: 'v1.0.0',
            items: [
              { text: '更新日志', link: '/zh/changelog' },
              { text: '贡献指南', link: '/zh/contributing' },
              { text: 'GitHub', link: 'https://github.com/your-org/your-repo' },
            ]
          }
        ],

        // 侧边栏配置
        sidebar: {
          '/zh/guide/': [
            {
              text: '开始使用',
              items: [
                { text: '介绍', link: '/zh/guide/introduction' },
                { text: '快速开始', link: '/zh/guide/getting-started' },
                { text: '安装', link: '/zh/guide/installation' },
                { text: '配置', link: '/zh/guide/configuration' },
              ]
            },
            {
              text: '功能特性',
              items: [
                { text: 'Markdown 支持', link: '/zh/guide/markdown' },
                { text: 'MDX 组件', link: '/zh/guide/mdx-components' },
                { text: '静态资源', link: '/zh/guide/static-assets' },
                { text: '路由系统', link: '/zh/guide/routing' },
                { text: '搜索功能', link: '/zh/guide/search' },
                { text: '国际化', link: '/zh/guide/i18n' },
              ]
            },
            {
              text: '进阶使用',
              items: [
                { text: '自定义主题', link: '/zh/guide/custom-theme' },
                { text: '插件开发', link: '/zh/guide/plugin-development' },
                { text: '部署', link: '/zh/guide/deployment' },
              ]
            }
          ],
          '/zh/api/': [
            {
              text: '配置',
              items: [
                { text: '介绍', link: '/zh/api/introduction' },
                { text: '站点配置', link: '/zh/api/site-config' },
                { text: '主题配置', link: '/zh/api/theme-config' },
                { text: 'Frontmatter', link: '/zh/api/frontmatter' },
              ]
            },
            {
              text: '运行时 API',
              items: [
                { text: '客户端 API', link: '/zh/api/client-api' },
                { text: 'Node API', link: '/zh/api/node-api' },
                { text: '插件 API', link: '/zh/api/plugin-api' },
              ]
            }
          ],
          '/zh/examples/': [
            {
              text: '示例',
              items: [
                { text: '基础用法', link: '/zh/examples/basic' },
                { text: '高级功能', link: '/zh/examples/advanced' },
                { text: '自定义主题', link: '/zh/examples/custom-theme' },
              ]
            }
          ]
        },

        // 编辑链接
        editLink: {
          pattern: 'https://github.com/your-org/your-repo/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页'
        },

        // 页脚配置
        footer: {
          message: '基于 MIT 许可发布',
          copyright: 'Copyright © 2024-present 您的名字'
        },

        // 其他文本配置
        lastUpdatedText: '最后更新',
        outlineTitle: '页面导航',
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '深色模式',
      }
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/your-org/your-repo' },
      { icon: 'twitter', mode: 'link', content: 'https://twitter.com/your-handle' },
      { icon: 'discord', mode: 'link', content: 'https://discord.gg/your-server' },
    ],

    // 搜索配置（主题级别）
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search'
          },
          modal: {
            noResultsText: 'No results for',
            resetButtonTitle: 'Reset search',
            footer: {
              selectText: 'to select',
              navigateText: 'to navigate',
              closeText: 'to close'
            }
          }
        }
      }
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: 'On This Page'
    },

    // 上一页/下一页
    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    },

    // 返回顶部
    returnToTopLabel: 'Return to top',

    // 外部链接图标
    externalLinkIcon: true,
  },
});
