# 快速开始

本指南将引导您创建第一个 Athen 文档站点。

## 前置要求

开始之前，请确保您已安装：

- **Node.js** 18 或更高版本
- **npm**、**yarn** 或 **pnpm** 包管理器
- 文本编辑器（推荐 VS Code）

## 安装

### 方式一：使用 create-athen（推荐）

使用 `create-athen` 脚手架工具是最快的开始方式：

```bash
# 使用 npm
npm create athen@latest my-docs

# 使用 yarn
yarn create athen my-docs

# 使用 pnpm
pnpm create athen my-docs
```

### 方式二：手动安装

您也可以手动设置 Athen：

```bash
# 创建项目目录
mkdir my-docs && cd my-docs

# 初始化 package.json
npm init -y

# 安装 Athen
npm install athen

# 创建文档目录
mkdir docs
```

## 项目结构

安装完成后，您的项目结构应该如下所示：

```
my-docs/
├── docs/
│   ├── guide/
│   │   └── getting-started.md
│   ├── api/
│   │   └── introduction.md
│   ├── public/
│   │   └── logo.svg
│   ├── athen.config.ts
│   └── index.md
├── package.json
└── README.md
```

## 配置

`athen.config.ts` 文件是您配置站点的地方：

```typescript
import { defineConfig } from 'athen';

export default defineConfig({
  title: '我的文档',
  description: '我的超棒文档站点',
  
  // 启用搜索
  search: {
    provider: 'flex'
  },
  
  themeConfig: {
    nav: [
      { text: '指南', link: '/zh/guide/getting-started' },
      { text: 'API', link: '/zh/api/introduction' }
    ],
    
    sidebar: {
      '/zh/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/zh/guide/introduction' },
            { text: '快速开始', link: '/zh/guide/getting-started' }
          ]
        }
      ]
    }
  }
});
```

## 开发

启动开发服务器：

```bash
npm run dev
```

您的站点将在 `http://localhost:5173` 可用。

## 编写内容

### 基础 Markdown

使用标准 Markdown 语法创建内容：

```markdown
# 页面标题

这是一个包含 **粗体** 和 *斜体* 文本的段落。

## 代码示例

\`\`\`javascript
function hello() {
  console.log('你好，Athen！');
}
\`\`\`

## 列表

- 项目 1
- 项目 2
- 项目 3
```

### Frontmatter

使用 frontmatter 为页面添加元数据：

```markdown
---
title: 自定义页面标题
description: 用于 SEO 的页面描述
sidebar: false
---

# 页面内容
```

### 链接

链接到文档中的其他页面：

```markdown
[快速开始](/zh/guide/getting-started)
[API 参考](/zh/api/introduction)
```

## 生产构建

准备部署时：

```bash
npm run build
```

这将生成一个包含静态站点的 `dist` 目录。

## 下一步

现在您有了一个基本的站点运行：

1. [配置您的站点](/zh/guide/configuration) - 自定义导航、侧边栏等
2. [了解 Markdown 功能](/zh/guide/markdown) - 发现高级 Markdown 功能
3. [设置搜索](/zh/guide/search) - 启用强大的搜索功能
4. [添加国际化](/zh/guide/i18n) - 支持多语言
5. [部署您的站点](/zh/guide/deployment) - 让您的文档上线

## 需要帮助？

- 查看我们的[示例](/zh/examples/basic)
- 加入我们的 [Discord 社区](https://discord.gg/your-server)
- 浏览 [GitHub 讨论](https://github.com/your-org/your-repo/discussions)
