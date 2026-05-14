# 基础配置

## base

- Type: `string`
- Default: `/`

站点将被部署到的基础 URL。如果您计划将站点部署到域的子目录中，您可以将其设置为子目录。

例如，如果您计划将站点部署到 `https://foo.github.io/bar/`，那么您应该将 `base` 设置为 `"/bar/"`：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  base: '/bar/'
});
```

## title

- Type: `string`
- Default: `"athen"`

站点的标题。这将用作主页的标题和 HTML 文档的标题。

## description

- Type: `string`
- Default: `""`

站点的描述。这将用作主页的描述和 HTML 文档的描述。

## icon

- Type: `string`
- Default: `""`

站点的图标。这将用作主页的图标和 HTML 文档的图标。Athen 将在 `public` 目录中找到您的图标。

## srcDir

- Type: `string`
- Default: `undefined`

您的 markdown 页面所在的目录。如果未定义，它将使用项目根目录或您传递给 CLI 的目录。

## outDir

- Type: `string`
- Default: `.athen/dist`

构建站点的输出目录。

## tempDir

- Type: `string`
- Default: `undefined`

中间构建文件的临时目录。

## lang

- Type: `string`
- Default: `"en-US"`

站点的默认语言。

## langs

- Type: `string[]`
- Default: `undefined`

站点支持的语言数组。

## head

- Type: `HeadConfig[]`
- Default: `[]`

要注入到 HTML `<head>` 中的自定义标签。

```js
import { defineConfig } from 'athen';

export default defineConfig({
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  ]
});
```

## colorScheme

- Type: `boolean`
- Default: `true`

是否显示暗黑模式/浅色模式切换按钮。

## enableSpa

- Type: `boolean`
- Default: `undefined`

在生产模式下启用单页应用路由。

## allowDeadLinks

- Type: `boolean`
- Default: `false`

存在死链时是否使构建失败。如果设置为 `true`，则构建不会失败。

## themeConfig

- Type: `ThemeConfig`
- Default: `{}`

主题配置。有关默认主题配置，请参见 [Theme Config](./config-theme)。

## vite

- Type: `ViteConfiguration`
- Default: `{}`

传递给 Vite 的自定义配置。此配置将与内部 Vite 配置合并。

## route

- Type: `RouteOptions`
- Default: `{}`

自定义路由扫描的配置。你可以使用 `include` 和 `exclude` 来控制哪些 Markdown 文件生成页面路由。

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  route: {
    // 忽略 secret 目录下的所有文件以及特定文件
    exclude: ['**/secret/**', 'drafts.md'],
    // 仅包含指定文件类型（可选）
    include: ['**/*.{md,mdx}']
  }
});
```

## plugins

- Type: `PluginOption[]`
- Default: `[]`

自定义 Vite 或 Athen 插件。如果插件与内置插件共享相同的 `name`，它将覆盖内置插件。

## theme

- Type: `string`
- Default: `undefined`

自定义主题包名称或相对/绝对路径。如果未提供，将使用内置默认主题。

## instances

- Type: `Array<{ root: string; base?: string; outDir?: string; }>`
- Default: `[]`

在单个存储库中的多个站点实例。

## search

- Type: `SearchConfig | boolean`
- Default: `true`

是否启用搜索。您可以配置搜索提供程序或完全禁用它：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  search: {
    provider: 'flex',
    searchOptions: { limit: 10, suggest: true }
  }
});
```

## analytics

- Type: `Record<string, any> | false`
- Default: `false`

配置分析集成。传递 `false` 会禁用内置分析。

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  analytics: {
    google: { id: 'G-XXXX' },
    baidu: { id: 'xxxx' },
    umami: { id: 'uuid', src: 'https://umami.example.com/script.js' }
  }
});
```
