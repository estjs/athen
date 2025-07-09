# 多实例站点（Multi-Instance Sites）

Athen 支持在 **同一个仓库中托管多个文档站点**。常见场景：

1. Monorepo 中包含若干包，每个包都需要独立的文档；
2. 产品文档拆分为 Marketing、DevDocs、API 等子站点。

---

## 配置方式

在根级 `athen.config.ts` 中添加 `instances` 字段：

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  // 根级其他配置（可选）
  title: 'Docs Portal',

  instances: [
    {
      root: 'docs/core',  // 子站点源码目录
      base: '/core/'      // 线上访问路径前缀
    },
    {
      root: 'docs/sdk',
      base: '/sdk/'
    }
  ]
});
```

每个实例都可以拥有自己的 `athen.config.ts`；如果缺失则继承根配置。

### CLI 用法

```bash
# 构建全部实例
pnpm docs:build  # 内部会循环 instances 数组

# 仅开发单个实例
athen dev docs/core
```

> 提示：搭配 `turbo run dev --filter=docs/*` 可并行启动所有实例。

---

## 输出结构

```
root
└─ dist
   ├─ core
   │  └─ index.html
   └─ sdk
      └─ index.html
```

每个子站点都会生成独立的 `sitemap.xml` 与 `search-index.json`。

---

## 限制

* 实例 **不可嵌套**；
* 跨实例链接不会自动改写，需使用绝对 `base`；
* Dev 服务器一次只能运行 **一个实例**（通过 CLI 路径指定）。

更多关于多实例的改进（如统一代理 Dev Server）正在 Roadmap 中跟踪。

## 开发流程

在开发阶段通常只需预览 **一个** 实例：

```bash
# 仅启动 docs/core
athen dev docs/core
```

如果你希望同时启动所有实例（例如在 monorepo 中），可结合 **Turbo** 等任务管理器：

```bash
# docs/core/package.json 中的脚本
{
  "scripts": {
    "dev": "athen dev ."
  }
}

# 根目录命令——并行运行 docs/* 的 dev
pnpm turbo run dev --filter=docs/*
```

脚本会为每个实例分配递增端口（8730、8731 …），方便并排预览。

## 常见坑位

* **跨实例链接** —— Athen **不会** 改写相对链接，请使用 **绝对 `base`**（如 `/sdk/`）从 *Core* 文档跳转至 *SDK*；
* **实例嵌套** 不被支持，所有 `root` 文件夹必须位于同一层级；
* `athen build` 输出始终在 `dist/<base>` 下，请确保你的静态托管服务允许该结构。
