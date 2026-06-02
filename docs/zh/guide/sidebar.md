# 侧边栏

Athen 根据文档路由生成左侧边栏。你可以通过三种方式控制它——单页 frontmatter、文件夹级 `_meta.json`，以及显式的 `themeConfig.sidebar` 配置块。

> 页面标题取自页面的第一个 `# 一级标题`（无标题时回退到文件名的人性化形式），不再提供 `title` frontmatter 字段。需要让侧边栏显示不同文案时，用 `sidebar_label`。

## 单页 frontmatter

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sidebar` | `boolean` | 设为 `false` 时从侧边栏隐藏该页（路由仍可访问）。 |
| `sidebar_position` | `number` | 分组内的排序键，数字越小越靠前。 |
| `sidebar_label` | `string` | 覆盖侧边栏显示文本（页面标题不变）。 |
| `sidebar_class_name` | `string` | 给侧边栏条目添加的额外 CSS class。 |
| `sidebar_key` | `string` | 条目的稳定唯一 key（用作渲染 key）。 |

```md title="guide/install.md"
---
sidebar_position: 2
sidebar_label: 简单
sidebar_class_name: green
sidebar_key: guide-install
---

# 安装
```

侧边栏条目文本优先取 `sidebar_label`，其次页面一级标题，最后路由路径。没有 `sidebar_position` 的页面会排在已排序页面之后，并按路由路径排序。把上述任一字段写在某文件夹的 `index.md` 里，即可控制整个分组。

如果页面需要保留路由但不出现在侧边栏中：

```md
---
sidebar: false
---

# 内部草稿
```

## 自动侧边栏

把 `themeConfig.sidebar` 设为 `'auto'`，即可根据路由自动生成分组。页面按第一段路径分组，例如 `guide/install.md` 会进入 `/guide/` 分组：

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    sidebar: 'auto'
  }
});
```

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

## 文件夹级 `_meta.json`

Athen 扫描目录时会寻找可选的 `_meta.json` 来自定义该文件夹的侧边栏。不需要写 `sidebar` 配置块——直接把文件放在 Markdown 旁边，自动侧边栏就会读取它。

```
docs/
  guide/
    getting-started.md
    install.md
    _meta.json          ← 控制 /guide/ 的侧边栏
```

最小示例：

```json
{
  "title": "指南",
  "items": ["getting-started", "install"]
}
```

生成的侧边栏：

```
指南
  快速开始（Getting Started 的人性化标题）
  安装（Install 的人性化标题）
```

### Schema

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 侧边栏分组标题；未填时使用目录名的人性化形式。 |
| `order` | `number` | 同级分组间的排序权重——数字越小越靠前。 |
| `items` | `string[]` | 子级文件或子目录名的有序列表（不含扩展名）。声明顺序即侧边栏顺序；未列出的子级自动追加在末尾。 |
| `collapsed` | `boolean` | 默认折叠分组（箭头收起）。 |
| `hidden` | `boolean` | 从侧边栏隐藏此目录及其所有子级（页面仍可访问）。 |

### items 排序规则

1. `items` 中列出的名称按声明顺序排在最前面。
2. 未列出的子级依然出现——按字母顺序排在固定集合之后。
3. 要**隐藏**某个子级，从 `items` 中省略它，并在该页 frontmatter 中设置 `sidebar: false`。
4. 文件名中的横线和下划线会自动人性化：`getting-started` → "Getting Started"；`api_reference` → "Api Reference"。

### 含子目录的示例

```
docs/
  api/
    _meta.json
    config-basic.md
    config-theme.mdx
  guide/
    getting-started.md
    install.md
    _meta.json
  index.md
```

`docs/guide/_meta.json`：

```json
{
  "title": "指南",
  "order": 1,
  "items": ["getting-started", "install"],
  "collapsed": false
}
```

`docs/api/_meta.json`：

```json
{
  "title": "API 参考",
  "order": 2,
  "items": ["config-basic", "config-theme"],
  "collapsed": false
}
```

结果：

```
指南                             (order 1)
  快速开始                        (pinned)
  安装                            (pinned)
API 参考                          (order 2)
  基础配置                        (pinned)
  主题配置                        (pinned)
```

## 三种来源的优先级

- `_meta.json#items` 固定侧边栏条目的**出现与顺序**。
- `frontmatter.sidebar_position` 设置单页在「固定或字母排序集合」内的权重。数字越小越靠前。
- `frontmatter.sidebar: false` 即使页面列在 `items` 中也会被移除。
- `frontmatter.sidebar_label` 覆盖显示名；`_meta.json#title` 仅提供默认文案。

如果同一路由前缀下既有 `_meta.json` 又有 `athen.config.ts` 中显式的 `sidebar` 配置块，显式块优先。
