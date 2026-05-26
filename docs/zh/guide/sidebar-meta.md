# _meta.json

Athen 在扫描目录时会寻找可选的 `_meta.json` 文件来自定义该文件夹的侧边栏。不需要写 `sidebar` 配置块 —— 直接把文件放在 Markdown 旁边即可。

## 快速上手

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

## Schema

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 侧边栏分组标题；未填时使用目录名的人性化形式。 |
| `order` | `number` | 同级分组间的排序权重 — 数字越小越靠前。 |
| `items` | `string[]` | 子级文件或子目录名的有序列表（不含扩展名）。声明顺序即侧边栏顺序；未列出的子级自动追加在末尾。 |
| `collapsed` | `boolean` | 默认折叠分组（箭头收起）。 |
| `hidden` | `boolean` | 从侧边栏隐藏此目录及其所有子级（页面仍可访问）。 |

### items 排序规则

1. `items` 中列出的名称按声明顺序排在最前面。
2. 未列出的子级依然出现 — 按字母顺序排在固定集合之后。
3. 要**隐藏**某个子级，从 `items` 中省略它，并在该页的 frontmatter 中设置 `sidebar: false`。
4. 文件名中的横线和下划线会自动人性化：`getting-started` → "Getting Started"；`api_reference` → "Api Reference"。

## 含子目录的示例

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

## 与 frontmatter 的交互

- `_meta.json#items` 固定侧边栏条目的**出现和顺序**。
- `frontmatter.order` 设置单页在按字母或固定排序集中的权重。数字越小越靠前。
- `frontmatter.sidebar: false` 即使页面列在 `items` 中也会移除。
- `frontmatter.title` 覆盖显示名；`_meta.json` 仅提供默认文案。

如果同一个路由前缀下既有 `_meta.json` 又有 `athen.config.ts` 中显式的 `sidebar` 配置块，显式块优先。
