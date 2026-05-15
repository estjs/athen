# @athen/plugin-mdx

[English](./README.md) | **简体中文**

Athen 的 MDX 处理插件 - 将 Markdown 和 MDX 文件转换为具有增强功能的 Essor 组件。

## 📦 安装

```bash
npm install @athen/plugin-mdx
# 或
pnpm add @athen/plugin-mdx
# 或
yarn add @athen/plugin-mdx
```

> **注意**: 此插件已自动包含在主 `athen` 包中。通常你不需要单独安装它。

## ✨ 特性

- **MDX 支持**: 直接在 Markdown 中编写 JSX 组件
- **语法高亮**: 由 Shiki 驱动，支持多种主题
- **目录生成**: 自动生成目录
- **前置元数据**: 支持 YAML 前置元数据
- **自定义指令**: 使用自定义语法增强 Markdown
- **代码功能**: 行号、高亮、复制按钮
- **Git 集成**: 从 Git 历史获取最后更新时间戳
- **Essor 组件**: 与 Essor 框架完全兼容

## 🚀 使用方法

### 基本使用

使用 Athen 时插件会自动配置。手动设置：

```ts
import { pluginMdx } from '@athen/plugin-mdx';

export default {
  plugins: [
    await pluginMdx({
      root: './docs',
      base: '/',
    })
  ]
};
```

### 配置选项

```ts
interface MdxOptions {
  root?: string;           // 根目录
  base?: string;           // 基础 URL
  enableSpa?: boolean;     // 启用 SPA 模式
  essor?: boolean;         // 启用 Essor 兼容性
  plugins?: Plugin[];      // 额外插件
}
```

## 📝 Markdown 功能

### 前置元数据

为页面添加元数据：

```markdown
---
title: 我的页面
description: 一个很棒的页面
layout: doc
---

# 我的页面内容
```

### 语法高亮

带语法高亮的代码块：

````markdown
```typescript
function hello(name: string): string {
  return `你好，${name}！`;
}
```
````

### 自定义指令

#### 提示框

```markdown
:::tip
这是一个提示信息。
:::

:::warning
这是一个警告信息。
:::

:::danger
这是一个危险信息。
:::

:::info
这是一个信息提示。
:::
```

#### 自定义容器

```markdown
:::details 点击展开
此内容默认隐藏。
:::
```

### 目录

从标题自动生成目录：

```markdown
[[toc]]
```

### 链接

增强的链接处理：

- **内部链接**: 自动 SPA 导航
- **外部链接**: 在新标签页打开，带安全属性
- **资源链接**: 正确的资源解析

### 代码功能

#### 行高亮

````markdown
```js {2,4-6}
function example() {
  const highlighted = true; // 此行被高亮
  const normal = true;
  const start = true;       // 这些行
  const middle = true;      // 被高亮
  const end = true;         // 作为范围
}
```
````

#### 行号

````markdown
```js:line-numbers
function withLineNumbers() {
  return '显示行号';
}
```
````

#### 文件名

````markdown
```js title="example.js"
function example() {
  return '在头部显示文件名';
}
```
````

## 🧩 MDX 组件

### 使用 Essor 组件

在 MDX 中导入和使用 Essor 组件：

```mdx
---
title: 组件演示
---

import { Button } from '../components/Button.tsx';
import { Counter } from '../components/Counter.tsx';

# 组件演示

这是一个按钮组件：

<Button type="primary">点击我！</Button>

这是一个交互式计数器：

<Counter initialValue={0} />
```

### 内置组件

插件提供了几个内置组件：

#### CodeGroup

```mdx
<CodeGroup>
<CodeGroupItem title="npm">

```bash
npm install athen
```

</CodeGroupItem>
<CodeGroupItem title="pnpm">

```bash
pnpm add athen
```

</CodeGroupItem>
</CodeGroup>
```

## 🔧 高级配置

### 自定义 Remark 插件

```ts
import remarkCustomPlugin from 'remark-custom-plugin';
import { pluginMdx } from '@athen/plugin-mdx';

export default {
  plugins: [
    await pluginMdx({
      plugins: [
        {
          name: 'custom-remark',
          plugin: remarkCustomPlugin,
          options: { /* 插件选项 */ }
        }
      ]
    })
  ]
};
```

### 自定义 Rehype 插件

```ts
import rehypeCustomPlugin from 'rehype-custom-plugin';

export default {
  plugins: [
    await pluginMdx({
      plugins: [
        {
          name: 'custom-rehype',
          plugin: rehypeCustomPlugin,
          enforce: 'post' // 在内置插件之后运行
        }
      ]
    })
  ]
};
```

### Shiki 配置

自定义语法高亮：

```ts
export default {
  plugins: [
    await pluginMdx({
      shiki: {
        theme: 'dark-plus',
        langs: ['javascript', 'typescript', 'vue', 'css'],
        lineNumbers: true
      }
    })
  ]
};
```

## 🎨 样式

### 代码块样式

自定义代码块外观：

```css
.athen-code-block {
  --code-bg: #1e1e1e;
  --code-text: #d4d4d4;
  --code-line-highlight: rgba(255, 255, 255, 0.1);
}
```

### 提示框样式

```css
.tip {
  --tip-bg: #f0f9ff;
  --tip-border: #0ea5e9;
  --tip-text: #0c4a6e;
}

.warning {
  --warning-bg: #fffbeb;
  --warning-border: #f59e0b;
  --warning-text: #92400e;
}
```

## 🔌 插件架构

MDX 插件由几个子插件组成：

### 核心插件

1. **pluginMdxRollup**: 使用 @mdx-js/rollup 的主要 MDX 转换
2. **pluginMdxEssor**: Essor 框架兼容性
3. **pluginMdxGit**: 基于 Git 的最后更新时间戳
4. **pluginMdxRawContent**: 用于搜索索引的原始内容提取

### Remark 插件

- **remark-gfm**: GitHub 风味 Markdown
- **remark-frontmatter**: YAML 前置元数据解析
- **remark-directive**: 自定义指令支持
- **remark-gemoji**: 表情符号支持
- **remarkPluginToc**: 目录生成
- **remarkPluginTip**: 提示框容器
- **remarkPluginNormalizeLink**: 链接规范化

### Rehype 插件

- **rehype-slug**: 标题 ID 生成
- **rehype-autolink-headings**: 自动标题链接
- **rehype-external-links**: 外部链接处理
- **rehypePluginShiki**: 语法高亮
- **rehypePluginPreWrapper**: 代码块包装器

## 📚 API 参考

### pluginMdx(options)

返回 Vite 插件数组的主插件函数。

**参数:**
- `options` (MdxOptions): 配置选项

**返回:**
- `Promise<Plugin[]>`: Vite 插件数组

### MdxOptions 接口

```ts
interface MdxOptions {
  root?: string;
  base?: string;
  enableSpa?: boolean;
  essor?: boolean;
  plugins?: Array<{
    name: string;
    plugin: any;
    options?: any;
    enforce?: 'pre' | 'post';
  }>;
  shiki?: {
    theme?: string;
    langs?: string[];
    lineNumbers?: boolean;
  };
}
```

## 🔗 相关链接

- [MDX 文档](https://mdxjs.com/)
- [Shiki 语法高亮器](https://shiki.matsu.io/)
- [Remark 插件](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- [Rehype 插件](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md)

## 📄 许可证

MIT © [estjs](https://github.com/estjs)
