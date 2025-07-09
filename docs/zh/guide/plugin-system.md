# Athen 插件系统

Athen 基于 Vite 插件机制构建，并针对文档站点场景做了少量增强。本文将介绍：

1. 框架自带哪些 **内置插件**
2. 如何编写 / 引入 **自定义插件**
3. 如何 **覆盖** 或 **禁用** 内置插件
4. 插件开发最佳实践

---

## 1. 内置插件一览

| 名称 | 作用 |
| ---- | ---- |
| `athen:config` | 提供站点数据虚拟模块、别名 `@theme` 等 |
| `athen:routes` | 读取目录结构生成路由 |
| `athen:transform` | MDX → JSX 转换，注入 front-matter |
| `plugin-mdx` | MDX 语法高亮 / TOC / Tip 等 |
| `unocss` | 原子化 CSS 引擎 |
| `plugin-svgr` | SVG → React 组件 |
| `inspect` | [`vite-plugin-inspect`](https://github.com/antfu/vite-plugin-inspect) 调试工具 |
| `plugin-search`（可选） | 基于 FlexSearch 的全文搜索 |
| `plugin-analytics`（可选） | 注入第三方统计脚本 |

> 带 *可选* 标记的插件需在 `athen.config.ts` 中显式开启，否则不会打包进产物。

---

## 2. 添加自定义插件

```ts title="athen.config.ts"
import { defineConfig } from 'athen';
import legacy from '@vitejs/plugin-legacy';
import myAthenPlugin from 'athen-plugin-awesome';

export default defineConfig({
  plugins: [
    legacy({ targets: ['defaults', 'not IE 11'] }),
    myAthenPlugin(),
  ],
});
```

要点：

* `plugins` 接收 **任何 Vite `PluginOption`**。可直接写对象、工厂函数或数组。
* 自定义插件会被放在 **内置插件之前**，因此当 `name` 相同时可覆盖默认实现。
* 插件同时在 dev & build 生效，除非你自行判断环境。

> 仍可通过 `vite` 字段整体传入 Vite 配置，但单独列出 `plugins` 可读性更好。

---

## 3. 覆盖 / 禁用 内置插件

### 覆盖

如果你的插件 **`name` 与某内置插件相同**，Athen 会移除默认插件并使用你的版本。

```ts
export default defineConfig({
  plugins: [
    {
      name: 'athen-plugin-search',
      enforce: 'pre',
      // 自定义实现，替换 FlexSearch 为 Algolia
    },
  ],
});
```

### 禁用

两种方式：

1. 使用显式开关（仅限有配置项的插件）
   ```ts
   export default defineConfig({
     themeConfig: {
       search: false, // 关闭全文搜索
     },
     analytics: false, // 关闭统计脚本
   });
   ```

2. 推送一个同名的 **空插件** 进行遮罩
   ```ts
   export default defineConfig({
     plugins: [
       { name: 'athen-plugin-search', apply() {} }, // 空实现
     ],
   });
   ```

---

## 4. 编写 Athen 专用插件

Athen 插件本质上仍是 Vite 插件，但通常需要拿到站点的 `root`、`base` 等信息。

```ts
import type { SiteConfig } from 'athen';
import type { Plugin } from 'vite';

export default function myPlugin(): Plugin {
  let site: SiteConfig;

  return {
    name: 'athen-plugin-my',

    configResolved(resolved) {
      site = (resolved as any).athenSite as SiteConfig;
    },

    transform(code, id) {
      // 基于 site.root 做点事情
    },
  };
}
```

建议以 `athen-plugin-*` 命名并发布到 npm，以便社区检索。

---

## 5. 常见问题

**Q: 插件执行顺序？**
最终数组为 `[...userPlugins, ...builtInPlugins]`，你仍可使用 Vite 的 `enforce` 设置更细粒度顺序。

**Q: 可以用 Rollup 专属插件？**
可以，Vite 在构建阶段会透传给 Rollup。

**Q: 如何在多个插件间共享工具函数？**
把公共逻辑提取成独立 npm 包或本地模块，按 ESModule 方式引入即可。
