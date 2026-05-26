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
- `markdown`：MDX/Markdown 编译配置。见下表。
- `search`：本地 FlexSearch 或 Algolia 搜索配置。
- `analytics`：统计集成。
- `vite`：与 Athen 内部配置合并的 Vite 配置。
- `plugins`：自定义 Vite/Athen 插件。
- `route`：高级路由扫描配置。常见场景优先使用顶层 `include`、`exclude`、`extensions`、`routeBasePath`。

## markdown

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `lineNumbers` | `boolean` | 代码块显示行号。 |
| `toc` | `boolean \| { minLevel?, maxLevel? }` | 对包含 `[[toc]]` 标记的页面生成目录块。 |
| `remarkPlugins` | `PluggableList` | 追加到 remark 流水线前部的插件。 |
| `rehypePlugins` | `PluggableList` | 追加到 rehype 流水线前部的插件。 |
| `externalLinks` | `{ target?, rel? }` | 外链默认 `target` 与 `rel`。 |
| `shiki.theme` | `string` | 单一 shiki 主题。 |
| `shiki.themes` | `{ light, dark }` | 双主题切换;输出对应 CSS 变量。 |

## route

只有需要高级路由扫描选项时才使用 `route`。大多数站点优先使用更浅的顶层别名:`srcDir`、`routeBasePath`、`include`、`exclude`、`extensions`。

## locales

各语言对 nav、sidebar、head、主题文案的覆盖。每条 locale 字段名与顶层一致 —— 未填的回退到根。

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 语言切换菜单中的显示名称(必填)。 |
| `lang` | `string` | 该 locale 下路由 `<html lang>` 的 BCP-47 标签。 |
| `title` / `description` | `string` | 该 locale 的站点标题与 meta description。 |
| `head` | `HeadConfig[]` | 该 locale 额外的 `<head>` 标签。 |
| `nav` / `sidebar` / `socialLinks` / `editLink` / `footer` / `logo` | various | 主题覆盖,字段与根一致。 |
| `outlineTitle` | `string` | 文档右侧目录的标题,如中文站可设置 `'本页内容'`。站点级回退来自根 `outlineTitle`;再无则使用 `'On this page'`。 |
| `lastUpdatedText` | `string` | 页脚 "最近更新" 文案。 |
| `prevPageText` / `nextPageText` | `string` | 翻页器文案。 |

