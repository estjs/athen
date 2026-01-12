# Athen

[English](./README.md) | **简体中文**

Athen 的核心框架包 - 基于 Essor 和 Vite 构建的现代文档框架。

## 📦 安装

```bash
npm install athen
# 或
pnpm add athen
# 或
yarn add athen
```

## 🚀 快速开始

### 1. 创建新项目

```bash
npx create-athen my-docs
cd my-docs
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 构建生产版本

```bash
pnpm build
```

## 📖 使用方法

### 配置

在项目根目录创建 `athen.config.ts` 文件：

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  title: '我的文档',
  description: '现代化文档站点',
  lang: 'zh-CN',
  base: '/',
  
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your/repo' }
    ]
  },
  
  // 多语言支持
  locales: {
    '/en/': {
      lang: 'en-US',
      title: 'My Documentation',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/' }
        ]
      }
    }
  }
});
```

### CLI 命令

Athen 提供强大的 CLI 用于开发和构建：

```bash
# 启动开发服务器
athen dev [root]

# 构建生产版本
athen build [root]

# 预览生产构建
athen preview [root]
```

### 项目结构

```
my-docs/
├── docs/              # 内容文件
│   ├── guide/
│   │   ├── index.md
│   │   └── installation.md
│   └── api/
│       └── index.md
├── public/            # 静态资源
├── athen.config.ts    # 配置文件
└── package.json
```

## ✨ 特性

### 基于 Essor 框架

Athen 利用现代 [Essor](https://github.com/estjs/essor) 响应式框架：

- **响应式组件**: 使用 Essor 的响应式系统和 JSX
- **客户端路由**: 由 [Essor-Router](https://github.com/estjs/essor-router) 驱动
- **组件组合**: 在文档中导入和使用 Essor 组件

### 约定式路由

- **自动路由**: `docs/` 中的文件自动成为路由
- **动态导入**: 开箱即用的代码分割和懒加载
- **嵌套路由**: 支持复杂的导航结构

### MDX 支持

- **Markdown + JSX**: 在 Markdown 中编写内容并嵌入组件
- **语法高亮**: 由 Shiki 驱动，支持多种主题
- **Remark/Rehype 插件**: 可扩展的内容处理管道

### 主题系统

- **默认主题**: 包含美观、响应式的主题
- **可自定义**: 轻松覆盖组件和样式
- **插槽 API**: 无需替换整个主题即可注入自定义组件

### 插件生态系统

- **内置插件**: 搜索、分析、MDX 处理等
- **Vite 兼容**: 使用任何 Vite 插件
- **自定义插件**: 使用插件 API 创建自己的插件

## 🔧 配置选项

### 站点配置

| 选项 | 类型 | 默认值 | 描述 |
|--------|------|---------|-------------|
| `title` | `string` | - | 站点标题 |
| `description` | `string` | - | 站点描述 |
| `lang` | `string` | `'zh-CN'` | 站点语言 |
| `base` | `string` | `'/'` | 基础 URL |
| `srcDir` | `string` | `'docs'` | 源目录 |
| `outDir` | `string` | `'dist'` | 输出目录 |

### 主题配置

| 选项 | 类型 | 描述 |
|--------|------|-------------|
| `nav` | `NavItem[]` | 导航菜单项 |
| `sidebar` | `Sidebar` | 侧边栏导航 |
| `socialLinks` | `SocialLink[]` | 社交媒体链接 |
| `footer` | `Footer` | 页脚配置 |
| `editLink` | `EditLink` | 编辑页面链接 |

### 高级配置

```ts
export default defineConfig({
  // Vite 配置
  vite: {
    // 任何 Vite 配置选项
  },
  
  // 自定义插件
  plugins: [
    // 在这里添加你的插件
  ],
  
  // 搜索配置
  search: {
    provider: 'flex', // 或 'algolia'
    // FlexSearch 选项...
  },
  
  // 分析
  analytics: {
    google: 'G-XXXXXXXXXX'
  }
});
```

## 🎨 主题

### 使用默认主题

默认主题提供干净、现代的界面：

- 响应式设计
- 深色/浅色模式切换
- 移动端友好导航
- 搜索功能
- 多语言支持

### 自定义样式

使用 CSS 变量覆盖主题样式：

```css
:root {
  --at-primary-color: #3b82f6;
  --at-text-color: #374151;
  --at-bg-color: #ffffff;
}
```

### 自定义组件

通过在项目中创建文件来替换主题组件：

```
.athen/
└── theme/
    ├── Layout.tsx      # 主布局
    ├── NavBar.tsx      # 导航栏
    └── SideBar.tsx     # 侧边栏
```

### 插槽 API

无需替换整个主题即可注入自定义组件：

```ts
export default defineConfig({
  themeConfig: {
    slots: {
      banner: () => <div class="announcement">新版本可用！</div>,
      sidebarExtra: () => <AdWidget />,
      footerExtra: () => <CustomFooter />
    }
  }
});
```

## 🔌 插件开发

使用 Vite 插件 API 创建自定义插件：

```ts
import type { Plugin } from 'vite';

export function myAthenPlugin(): Plugin {
  return {
    name: 'my-athen-plugin',
    // 插件实现
  };
}
```

在配置中使用：

```ts
export default defineConfig({
  plugins: [
    myAthenPlugin()
  ]
});
```

## 🌍 国际化

### 多语言设置

```ts
export default defineConfig({
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '我的文档'
    },
    '/en/': {
      lang: 'en-US',
      title: 'My Docs'
    },
    '/ja/': {
      lang: 'ja-JP',
      title: '私のドキュメント'
    }
  }
});
```

### 目录结构

```
docs/
├── index.md           # 中文首页
├── guide/
│   └── index.md
├── en/
│   ├── index.md       # 英文首页
│   └── guide/
│       └── index.md
└── ja/
    ├── index.md       # 日文首页
    └── guide/
        └── index.md
```

## 📚 API 参考

### defineConfig

```ts
function defineConfig(config: UserConfig): UserConfig
```

使用完整的 TypeScript 支持定义你的 Athen 配置。

### CLI API

CLI 提供对 Athen 功能的编程访问：

```ts
import { build, createDevServer } from 'athen';

// 启动开发服务器
const server = await createDevServer('./docs');
await server.listen();

// 构建生产版本
await build('./docs');
```

## 🔗 相关包

- [`@athen/plugin-mdx`](../plugin-mdx) - MDX 处理插件
- [`@athen/plugin-search`](../plugin-search) - 全文搜索插件
- [`@athen/plugin-analytics`](../plugin-analytics) - 分析集成
- [`create-athen`](../create-athen) - 项目脚手架工具

## 📄 许可证

MIT © [estjs](https://github.com/estjs)
