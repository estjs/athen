# 正文页面

你可以配置正文页面的侧边栏、大纲等信息。

## 侧边栏

你可以在正文页面的 frontmatter 中配置侧边栏：

```md
---
sidebar: false
---
```

`sidebar` 的值为一个布尔值，如果为 `false`，则不会显示侧边栏。

### 自动侧边栏

当你希望 Athen 根据文档路由自动生成侧边栏时，可以把 `themeConfig.sidebar` 设置为 `'auto'`：

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    sidebar: 'auto'
  }
});
```

自动生成的条目标题优先读取 frontmatter 的 `title`，其次读取页面一级标题，最后使用路由路径。页面会按第一段路径分组，例如 `guide/install.md` 会进入 `/guide/` 分组。

通过 frontmatter 的 `order` 控制同一分组内的排序：

```md title="guide/install.md"
---
title: 安装
order: 2
---

# 安装
```

数字越小越靠前。没有 `order` 的页面会排在已排序页面之后，并按路由路径排序。为了兼容旧配置，也支持 `sidebarOrder`。

自动侧边栏可以和手写侧边栏混用：

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    sidebar: {
      '/guide/': 'auto',
      '/api/': [
        {
          text: 'API',
          items: [{ text: '配置', link: '/api/config' }]
        }
      ]
    }
  }
});
```

多语言站点建议在每个语言配置里设置 `sidebar: 'auto'`。Athen 会在当前语言前缀内生成侧边栏，不同语言的分组互不混用：

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  defaultLocale: 'en',
  locales: {
    '/': {
      label: 'English',
      lang: 'en-US',
      sidebar: 'auto'
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh-CN',
      sidebar: 'auto'
    },
    '/fr/': {
      label: 'Français',
      lang: 'fr-FR',
      sidebar: 'auto'
    }
  }
});
```

如果页面需要保留路由但不出现在自动侧边栏中，可以设置：

```md
---
sidebar: false
---

# 内部草稿
```

## 大纲

### 关闭大纲

大纲信息将会呈现在右边的侧栏，你可以在正文页面的 frontmatter 中配置大纲信息：

```md
---
outline: false
---
```

`outline` 的值为一个布尔值，如果为 `false`，则不会显示大纲信息。

### 配置大纲标题

通过 `themeConfig.outlineTitle` 配置大纲的标题：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    outlineTitle: 'ON THIS PAGE'
  }
});
```

## 上一页/下一页

通过 `themeConfig.prevPageText` 或 `themeConfig.nextPageText` 配置上一页/下一页文本：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    prevPageText: 'Previous Page',
    nextPageText: 'Next Page'
  }
});
```

## 编辑链接

通过 `themeConfig.editLink` 配置编辑链接：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/estjs/athen/tree/master/docs/:path'
    }
  }
});
```

## 上次更新

通过 `themeConfig.lastUpdatedText` 配置上次更新的显示文本：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    lastUpdatedText: 'Last Updated'
  }
});
```
