# Athen examples

这些示例用于展示 Athen 最值得复制的配置能力。示例已经按使用场景合并，避免每个小配置都拆成一个单独项目。

## 已提供的示例

| 示例 | 价值 |
| --- | --- |
| `basic` | 浅层配置、Markdown/MDX 编译选项、clean URL、trailing slash、rewrites、严格链接检查。 |
| `docs-site` | 完整文档站：完全自定义主页、自动侧边栏、多语言导航和三种语言切换。 |
| `integrations` | 集成能力：本地 FlexSearch、常见 Analytics、最小 Athen/Vite 插件，以及 Algolia/禁用统计 preset。 |
| `custom-theme` | 本地主题入口，展示如何完全接管页面外壳。 |

## 运行

```bash
pnpm exec athen dev examples/basic
pnpm exec athen dev examples/docs-site
pnpm exec athen dev examples/integrations
pnpm exec athen dev examples/custom-theme
```

互斥配置作为 preset 放在集成示例下：

- `examples/integrations/algolia`：Algolia DocSearch 配置。
- `examples/integrations/analytics-disabled`：`analytics: false` 禁用内置统计注入。

## 后续还值得补的示例

- Multi-instance：一个仓库构建多个文档站点。
- Theme package：把本地主题打包成可复用 npm 包。
