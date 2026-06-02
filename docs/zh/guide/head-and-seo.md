# Head 与 SEO

Athen 通过 [Unhead](https://unhead.unjs.io) 来驱动 `<title>`、`<html lang>` 和 `<meta name="description">`。同一套代码同时覆盖首屏 SSG 渲染和后续每一次 SPA 跳转,不需要额外接客户端 head 同步。

## `<title>` 是怎么拼出来的

唯一的模板是 `{页面标题} | {站点标题}`,无可配置。页面标题的回退链:

1. 路由 resolve 后的 title——页面的 `# 一级标题`,没有标题时回退到文件名的 humanize
2. `siteData.title`(没有页面标题时单独作为整个 title)

如果页面标题等于站点标题,`|` 拼接会自动塌缩,不会出现 `Athen | Athen` 这种情况。

## 单页配置

通过 frontmatter 设置:

```md
---
description: 五分钟跑通 Athen。
---

# 快速开始

…
```

页面标题取自 `# 一级标题`(上例的 `快速开始`),不再提供 `title` frontmatter 字段。`frontmatter.description` 优先于 locale 描述和站点描述。

## 按 locale 配置

每个 locale 的 `<head>` 入口、描述、`<html lang>` 写在 `locales` 下:

```ts
export default defineConfig({
  lang: 'en',
  title: 'Athen',
  description: 'Vite + Essor 文档框架',

  locales: {
    '/': {
      label: 'English',
      lang: 'en',
      outlineTitle: 'On this page',
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh',
      description: 'Vite 与 Essor 驱动的文档框架',
      outlineTitle: '本页内容',
      head: [
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ],
    },
  },
});
```

`/zh/` 下的任何路由都会自动输出 `<html lang="zh">`,并继承该 locale 的描述、head 标签、目录侧栏标题。

## 站点级

`siteData.head` 给所有页面追加 tag。元组形式 `[tag, attrs?, children?]`:

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#3b8eea' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify({ '@context': 'https://schema.org' })],
  ],
});
```

Locale 级 `head` 会追加在站点级之上。

## SPA 跳转

用户点击内部链接时,Athen 不会重载文档。响应式 `pageData` 更新,`runtime/head.ts` 里的 `effect` 调用 Unhead patch,Unhead 把 diff 应用到 `document.head` 上。因此:

- `document.title` 实时切换
- 跨 locale 时 `<html lang>` 切换(如 `/guide/x` → `/zh/guide/x`)
- `<meta name="description">` 就地替换

不会全页刷新,也不会出现旧 meta 残留。如果你看到全页刷新,说明那个链接的 `href` 越出了 SPA 边界(跨域或外部 URL)。

## 暂未暴露的能力

- 给主题作者使用的 `useHead()` composable。目前只在内部使用,如有需求请提 issue。
- `titleTemplate` 配置。title 拼接固定为 `{页面} | {站点}`(塌缩规则同上)。
