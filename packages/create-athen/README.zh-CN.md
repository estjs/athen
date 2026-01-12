# create-athen

[English](./README.md) | **简体中文**

用于创建新 Athen 文档项目的脚手架工具，提供交互式设置。

## 📦 安装

您无需全局安装此包。直接使用 npm/pnpm/yarn：

```bash
# 使用 npm
npm create athen@latest my-docs

# 使用 pnpm（推荐）
pnpm create athen my-docs

# 使用 yarn
yarn create athen my-docs
```

## 🚀 快速开始

### 交互式设置

```bash
pnpm create athen
```

这将提示您输入：
- **项目名称**: 文档项目的名称
- **包名称**: npm 包名称（从项目名称自动生成）
- **安装依赖**: 是否自动安装依赖
- **启动开发服务器**: 是否立即启动开发服务器

### 非交互式设置

```bash
# 使用默认设置创建项目
pnpm create athen my-docs --yes

# 创建并安装依赖
pnpm create athen my-docs --install

# 跳过所有提示并自动安装
pnpm create athen my-docs --yes --install
```

## 🎯 CLI 选项

| 选项 | 别名 | 描述 |
|--------|-------|-------------|
| `--yes` | `-y` | 跳过所有提示并使用默认值 |
| `--install` | `-i` | 自动安装依赖 |
| `--template` | `-t` | 指定模板（目前仅有默认模板） |

### 示例

```bash
# 基本用法
pnpm create athen my-docs

# 跳过提示
pnpm create athen my-docs -y

# 自动安装依赖
pnpm create athen my-docs -i

# 跳过提示并自动安装
pnpm create athen my-docs -y -i

# 指定模板（未来功能）
pnpm create athen my-docs -t typescript
```

## 📁 生成的项目结构

脚手架工具创建一个完整的 Athen 项目，结构如下：

```
my-docs/
├── docs/                    # 文档内容
│   ├── guide/
│   │   ├── index.md        # 入门指南
│   │   └── installation.md # 安装说明
│   ├── api/
│   │   └── index.md        # API 文档
│   └── index.md            # 首页
├── public/                  # 静态资源
│   ├── logo.png            # 站点 logo
│   └── favicon.ico         # 站点图标
├── .gitignore              # Git 忽略规则
├── .npmrc                  # npm 配置
├── athen.config.ts         # Athen 配置
├── package.json            # 项目依赖和脚本
├── pnpm-lock.yaml         # 锁定文件（如果使用 pnpm）
└── README.md              # 项目 README
```

## ⚙️ 生成的配置

### package.json 脚本

```json
{
  "scripts": {
    "dev": "athen dev",
    "build": "athen build", 
    "preview": "athen preview"
  }
}
```

### athen.config.ts

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  title: '我的文档',
  description: '使用 Athen 构建的现代文档站点',
  
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your/repo' }
    ]
  }
});
```

## 📝 模板内容

### 首页 (docs/index.md)

```markdown
---
layout: home
title: 我的文档
hero:
  name: 我的文档
  text: 现代文档，简单制作
  tagline: 基于 Athen 框架构建
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/your/repo
features:
  - title: 快速轻量
    details: 基于 Vite 构建，开发快如闪电，构建高度优化
  - title: Markdown 驱动
    details: 使用 Markdown 编写内容，支持 MDX 交互组件
  - title: 可自定义
    details: 灵活的主题系统，完整的 TypeScript 支持
---
```

### 指南页面

模板包含示例指南页面：
- 入门说明
- 安装指南
- 配置示例
- 最佳实践

## 🔧 创建后的自定义

### 更新站点信息

1. **编辑 `athen.config.ts`**:
   ```ts
   export default defineConfig({
     title: '您的站点标题',
     description: '您的站点描述',
     // ... 其他配置
   });
   ```

2. **更新 `package.json`**:
   ```json
   {
     "name": "your-docs",
     "description": "您的文档站点"
   }
   ```

3. **替换 `docs/` 中的内容**:
   - 更新首页内容
   - 添加您的文档页面
   - 自定义导航和侧边栏

### 添加功能

```ts
// athen.config.ts
export default defineConfig({
  // 启用搜索
  search: {
    provider: 'flex'
  },
  
  // 添加分析
  analytics: {
    google: { id: 'G-XXXXXXXXXX' }
  },
  
  // 多语言支持
  locales: {
    '/en/': {
      lang: 'en-US',
      title: 'My Documentation'
    }
  }
});
```

## 🎨 模板变体（未来）

目前，`create-athen` 提供单一的默认模板。未来版本将包括：

- **TypeScript 模板**: 增强的 TypeScript 配置
- **多语言模板**: 预配置的 i18n 设置
- **博客模板**: 文档 + 博客混合
- **API 模板**: 专注于 API 文档
- **组件库模板**: 用于组件文档

## 🔄 开发工作流

创建项目后：

1. **启动开发服务器**:
   ```bash
   cd my-docs
   pnpm dev
   ```

2. **编辑内容**:
   - 修改 `docs/` 目录中的文件
   - 更改通过 HMR 立即反映

3. **构建生产版本**:
   ```bash
   pnpm build
   ```

4. **预览生产构建**:
   ```bash
   pnpm preview
   ```

## 🛠️ 故障排除

### 常见问题

**权限错误**:
```bash
# 如果遇到权限错误，请尝试：
npx create-athen@latest my-docs
```

**包管理器检测**:
工具自动从以下来源检测您的包管理器：
- `npm_execpath` 环境变量
- `npm_config_user_agent` 环境变量
- 如果检测失败则回退到 npm

**模板错误**:
```bash
# 如果模板文件丢失，请尝试：
pnpm create athen@latest my-docs
```

### 获取帮助

如果遇到问题：
1. 查看 [Athen 文档](https://github.com/estjs/athen)
2. 在 [GitHub](https://github.com/estjs/athen/issues) 上开启 issue
3. 加入我们的社区讨论

## 📚 API 参考

### CLI 接口

```ts
interface CreateAthenOptions {
  projectName?: string;    // 目标目录名称
  template?: string;       // 模板变体（未来）
  yes?: boolean;          // 跳过提示
  install?: boolean;      // 自动安装依赖
}
```

### 编程使用

```ts
import { createAthenProject } from 'create-athen';

await createAthenProject({
  projectName: 'my-docs',
  template: 'default',
  autoInstall: true
});
```

## 🔗 相关链接

- [Athen 文档](../athen)
- [Athen 示例](https://github.com/estjs/athen/tree/main/examples)
- [Vite 文档](https://vitejs.dev/)

## 📄 许可证

MIT © [estjs](https://github.com/estjs)
