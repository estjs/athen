# 基础配置

Athen 的配置应该保持扁平。常用选项放在顶层，只有天然成组的能力使用对象，例如 `themeConfig`、`markdown`、`search`、`vite`、`route`。

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  title: '我的文档',
  description: '产品文档',
  lang: 'zh-CN',
  base: '/',
  favicon: '/logo.svg',
  cleanUrls: true,
  trailingSlash: false,
  rewrites: {
    '/old-guide': '/guide/getting-started',
  },
  onBrokenLinks: 'throw',

  themeConfig: {
    nav: [{ text: '指南', link: '/guide/getting-started' }],
    sidebar: 'auto',
    links: [{ icon: 'github', link: 'https://github.com/estjs/athen' }],
  },

  defaultLocale: 'zh',
  locales: {
    '/': {
      label: '简体中文',
      lang: 'zh-CN',
      sidebar: 'auto',
    },
    '/en/': {
      label: 'English',
      lang: 'en-US',
      nav: [{ text: 'Guide', link: '/en/guide/getting-started' }],
      sidebar: 'auto',
    },
  },

  markdown: {
    shiki: { theme: 'dark-plus' },
  },
});
```

## 顶层选项

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 站点标题。 |
| `description` | `string` | 站点描述和默认 HTML meta description。 |
| `lang` | `string` | 默认语言标签。 |
| `base` | `string` | 部署基础 URL。 |
| `favicon` | `string` | favicon 路径。`icon` 仍作为兼容别名。 |
| `head` | `HeadConfig[]` | 注入 HTML `<head>` 的额外标签。 |
| `colorScheme` | `boolean` | 启用深浅色模式支持。 |
| `srcDir` | `string` | 页面扫描目录。 |
| `outDir` | `string` | 构建输出目录。 |
| `tempDir` | `string` | 临时构建目录。 |
| `enableSpa` | `boolean` | 生产构建启用 SPA 路由。 |
| `onBrokenLinks` | `'throw' \| 'warn' \| 'ignore'` | 死链处理策略。 |
| `cleanUrls` | `boolean` | 生成不暴露文件扩展名的公开页面 URL。 |
| `trailingSlash` | `boolean` | 控制生成的页面 URL 是否以 `/` 结尾。 |
| `rewrites` | `Record<string, string>` | 在链接检查中将旧公开路径视为新路径的别名。 |
| `routeBasePath` | `string` | 给生成路由增加前缀。 |
| `include` / `exclude` | `string[]` | 包含或排除路由文件。 |
| `extensions` | `string[]` | 可生成路由的文件扩展名。 |
| `theme` | `string` | 自定义主题包或路径。 |
| `editUrl` | `string` | 使用 `:path` 的编辑链接 URL 模板。 |
| `defaultLocale` | `string` | 默认语言 key 或语言标签。 |
| `locales` | `Record<string, LocaleConfig>` | 各语言的 nav/sidebar/文本覆盖。 |

## 成组配置

- `themeConfig`：默认主题导航、侧边栏、链接、页脚、大纲、插槽和页面文案。
- `markdown`：MDX/Markdown 编译配置，例如 Shiki 主题、行号、`remarkPlugins`、`rehypePlugins`。
- `search`：本地 FlexSearch 或 Algolia 搜索配置。
- `analytics`：统计集成。
- `vite`：与 Athen 内部配置合并的 Vite 配置。
- `plugins`：自定义 Vite/Athen 插件。
- `route`：高级路由扫描配置。常见场景优先使用顶层 `include`、`exclude`、`extensions`、`routeBasePath`。

## route

只有需要高级路由扫描选项时才使用 `route`。大多数站点优先使用更浅的顶层别名：`srcDir`、`routeBasePath`、`include`、`exclude`、`extensions`。

## 迁移说明

旧的 VitePress 风格 `themeConfig` 仍然是推荐主题入口。更深的实验写法会继续兼容，但新项目应优先使用扁平写法：

| 较深写法 | 推荐扁平写法 |
| --- | --- |
| `site.title` | `title` |
| `site.description` | `description` |
| `site.base` | `base` |
| `site.favicon` | `favicon` |
| `docs.srcDir` | `srcDir` |
| `docs.onBrokenLinks` | `onBrokenLinks` |
| `docs.routeBasePath` | `routeBasePath` |
| `theme.config` | `themeConfig` |
| `theme.socialLinks` | `themeConfig.links` |
| `i18n.locales` | `locales` |

## 对比结论

Athen 现在支持 VitePress 和 Docusaurus 中最有价值的浅层配置能力：

- `themeConfig.sidebar: 'auto'` 可基于路由元数据自动生成 sidebar。
- `onBrokenLinks` 会在构建时检查本地 Markdown 链接和 anchor。
- `cleanUrls`、`trailingSlash`、`rewrites` 用于稳定公开 URL。
- `defaultLocale` 和 `locales` 提供各语言的 nav/sidebar/文本覆盖。
