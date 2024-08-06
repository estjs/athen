# 基础配置

## base

- Type: `string`
- Default: `/`

部署基准路径。比如，如果你计划将你的站点部署到 `https://foo.github.io/bar/`，那么你应该将 `base` 设置为 `"/bar/"`：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  base: '/bar/'
});
```

## title

- Type: `string`
- Default: `"athen"`

站点标题。这个参数将被用作 HTML 页面的标题。例如：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  title: '我的站点'
});
```

## description

- Type: `string`
- Default: `""`

站点描述。这将用作 HTML 页面的描述。例如：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  description: '这是我的站点'
});
```

## icon

- Type: `string`
- Default: `""`

站点图标。这个路径将用作 HTML 页面的图标路径。例如：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  icon: '/icon.png'
});
```

然后 Athen 会在 `public` 目录中找到你的图标。

## colorScheme

- Type: `boolean`
- Default: `true`

是否出现暗黑模式/白天模式切换按钮。比如：

```js
import { defineConfig } from 'athen';

export default defineConfig({
  // 不出现这个按钮
  colorScheme: false
});
```

## outDir

- Type: `string`
- Default: `.athen/dist`

自定义构建站点的输出目录。比如:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  outDir: 'dist'
});
```
