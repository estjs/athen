# Athen – 现代化文档框架

[English](./README.md) | **简体中文**

Athen 是一个基于 **Vite** 和 **MDX** 的静态站点生成器，构建在 **Essor** 框架生态系统之上。专为现代产品文档设计，Athen 专注于开发者体验、性能和可扩展性，同时提供一流的 TypeScript 支持。

> **基于 Essor 构建**: Athen 利用 [Essor](https://github.com/estjs/essor) 响应式框架和 [Essor-Router](https://github.com/estjs/essor-router) 提供现代化、组件驱动的开发体验。

---

## ✨ 特性

- **即时开发服务器** – 由 Vite 驱动，提供闪电般的 HMR。
- **Essor 框架** – 基于现代 Essor 响应式框架，支持 JSX。
- **MDX 处理管道** – 内置 remark/rehype 插件（Shiki、目录、提示、链接、原始内容、最后更新）。
- **组件优先** – 使用 Essor JSX 或纯 Markdown 编写页面；随处导入 Essor 组件。
- **约定式路由** – 基于文件系统的自动路由，支持动态导入和预加载。
- **主题系统** – 包含默认主题；使用清晰的 API 扩展或创建自己的主题。
- **插件生态系统** – 内置 MDX、UnoCSS、搜索、分析等插件；通过 `plugins:` 字段添加自己的插件。
- **国际化和实时切换** – 支持多语言服务，实时语言切换。
- **静态站点生成** – SEO 友好的 SSG，支持预渲染。
- **测试优先** – 全面的单元测试和端到端测试，使用 Vitest + Playwright。
- **一键脚手架** – `npx create-athen` 在几秒钟内启动新项目。

---

## 📦 包

此 monorepo 包含以下包：

| 包 | 描述 | 版本 |
|---------|-------------|---------|
| [`athen`](./packages/athen) | 核心框架和 CLI | ![npm](https://img.shields.io/npm/v/athen) |
| [`@athen/plugin-mdx`](./packages/plugin-mdx) | MDX 处理插件 | ![npm](https://img.shields.io/npm/v/@athen/plugin-mdx) |
| [`@athen/plugin-search`](./packages/plugin-search) | 全文搜索插件 | ![npm](https://img.shields.io/npm/v/@athen/plugin-search) |
| [`@athen/plugin-analytics`](./packages/plugin-analytics) | 分析集成 | ![npm](https://img.shields.io/npm/v/@athen/plugin-analytics) |
| [`create-athen`](./packages/create-athen) | 项目脚手架工具 | ![npm](https://img.shields.io/npm/v/create-athen) |

---

## 🚀 快速开始

```bash
# 1. 创建新项目
npx create-athen my-docs
cd my-docs

# 2. 安装依赖
pnpm install

# 3. 启动本地开发服务器
pnpm dev

# 4. 构建生产版本
pnpm build

# 5. 预览静态输出
pnpm preview
```

---

## 📁 项目结构

由 `create-athen` 生成的典型用户项目结构如下：

```
my-docs/
├─ docs/          # Markdown / MDX 内容
├─ public/        # 静态资源，按原样复制
├─ athen.config.ts# 站点配置文件
└─ package.json   # 脚本和依赖
```

---

## ⚙️ 配置要点

配置位于 `athen.config.ts`（原生支持 TypeScript）：

```ts
import { defineConfig } from "athen";

export default defineConfig({
  title: "我的文档",
  lang: "zh-CN",
  base: "/",
  themeConfig: {
    nav: [
      { text: "指南", link: "/guide/getting-started" },
      { text: "API", link: "/api/" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始使用",
          items: [
            { text: "介绍", link: "/guide/" },
            { text: "安装", link: "/guide/installation" }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/your/repo" }
    ]
  },
  // 多语言支持
  locales: {
    "/en/": { 
      lang: "en-US", 
      title: "My Docs",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/en/guide/getting-started" }
        ]
      }
    }
  },
  // 搜索配置
  search: {
    provider: "flex" // 或 "algolia"
  },
  // 分析配置
  analytics: {
    google: "G-XXXXXXXXXX"
  }
});
```

---

## 🎨 主题和样式

- 默认使用 **UnoCSS** 原子化 CSS；可轻松切换到 Tailwind 或原生 CSS。
- 通过文件系统覆盖 SCSS 变量或任何组件。
- 提供自己的 `Layout.tsx` 创建完全自定义的外观。
- 基于 **Essor** 组件，提供最大的灵活性。

### 布局插槽 API

您可以将自定义 Essor 组件注入到预定义位置，而无需完全替换默认主题。
在 `athen.config.ts` 的 `themeConfig` 下添加 `slots` 字段：

```tsx
export default defineConfig({
  themeConfig: {
    slots: {
      banner: () => <div class="my-banner">✨ 新版本发布！ ✨</div>,
      sidebarExtra: () => <AdWidget />,
      footerExtra: CustomFooterNote,
    },
  },
});
```

插槽映射：

| 插槽键 | 渲染位置 |
|----------|-----------------|
| `banner` | 顶部导航栏正下方 |
| `sidebarExtra` | 侧边栏导航底部 |
| `footerExtra` | 页面底部，主要内容之后 |

第三方主题可以通过提供自己的组件来覆盖任何或所有这些插槽。

---

## 🔌 插件系统

Athen 的插件层基于 Vite 的 API 构建，并添加了一些面向文档的便利功能。

### 内置插件

| 名称 | 用途 |
| ---- | ------- |
| `athen:config` | 暴露站点数据 + 别名 |
| `athen:routes` | 基于约定的文件系统路由 |
| `athen:site-data` | 站点配置虚拟模块 |
| `plugin-mdx` | Remark/rehype 管道与 Shiki 高亮 |
| `unocss` | 原子化 CSS 框架 |
| `plugin-svgr` | 将 SVG 导入为 Essor 组件 |
| `plugin-search` | FlexSearch 全文搜索（可选） |
| `plugin-analytics` | 分析集成（可选） |
| `vite-plugin-inspect` | 开发检查器 |

### 使用自定义插件

```ts title="athen.config.ts"
export default defineConfig({
  plugins: [
    legacy(), // 任何 Vite 插件都可以工作
    myCoolPlugin(), // 您自己的 athen-plugin-*
  ],
});
```

*此数组中的插件在内置插件**之前**运行。* 如果插件与内置插件具有相同的 `name`，内置插件将被移除——这使得交换默认搜索或分析实现变得轻松。

要完全禁用内置插件，请将其配置设置为 `false`（例如 `search: false`、`analytics: false`）或使用空操作插件覆盖它。

想要发布？使用 `athen-plugin-*` 前缀命名并发布到 npm。

---

## 🌍 国际化 (i18n)

- 在配置的 `locales` 字段中定义语言配置。
- 默认主题中包含运行时语言切换器组件。
- 为每种语言构建时生成静态页面，支持客户端路由。
- 自动语言检测和重定向支持。

---

## 🔥 热模块替换

- 内容编辑（Markdown、MDX、Essor 组件）即时更新，不丢失状态。
- 配置更改自动热重载。
- 插件和主题更改在开发期间立即反映。

---

## 🧪 测试和覆盖率

- **Vitest** 用于单元/集成测试——开箱即用的配置。
- **Playwright** 用于端到端测试；CI 工作流针对生产构建运行。
- 所有包的全面测试覆盖。
- monorepo 中包含示例测试供参考。

---

## 🙌 贡献

1. **设置**: `pnpm install` – 安装工作区依赖。
2. **开发**: `pnpm dev` – 运行示例文档进行本地开发。
3. **构建**: `pnpm build` – 构建所有包。
4. **测试**: `pnpm test` – 运行单元测试和端到端测试。
5. **代码检查**: `pnpm lint` – 检查代码质量。

向 `main` 分支提交 PR；所有提交必须遵循 [约定式提交](https://conventionalcommits.org/)。

---

## 🔗 相关项目

- [Essor](https://github.com/estjs/essor) - 驱动 Athen 的响应式框架
- [Essor-Router](https://github.com/estjs/essor-router) - Essor 的客户端路由

---

## 📄 许可证

MIT © 2023-present [estjs](https://github.com/estjs)
