# API 介绍

欢迎来到 Athen API 文档。本节涵盖了 Athen 中所有可用的配置选项、运行时 API 和插件开发接口。

## 概述

Athen 提供几种类型的 API：

### 配置 API
- **站点配置**: 基本站点设置和元数据
- **主题配置**: 导航、侧边栏和主题自定义
- **插件配置**: 插件特定的设置和选项

### 运行时 API
- **客户端 API**: 浏览器端功能和工具
- **Node API**: 构建时和服务器端功能
- **插件 API**: 插件开发接口

### 组件 API
- **内置组件**: 开箱即用的组件
- **主题组件**: 可自定义的主题元素
- **插件组件**: 插件提供的组件

## 快速参考

### 站点配置

```typescript
import { defineConfig } from 'athen';

export default defineConfig({
  title: '我的站点',
  description: '站点描述',
  base: '/',
  
  // 搜索配置
  search: {
    provider: 'flex'
  },
  
  // 主题配置
  themeConfig: {
    nav: [...],
    sidebar: {...}
  }
});
```

### 运行时 API

```typescript
import { usePageData, useRouter } from 'athen/client';

// 获取页面数据
const { page, site } = usePageData();

// 获取路由实例
const router = useRouter();
```

### 插件开发

```typescript
import type { Plugin } from 'athen';

export function myPlugin(options = {}): Plugin {
  return {
    name: 'my-plugin',
    configResolved(config) {
      // 插件逻辑
    }
  };
}
```

## 类型定义

Athen 使用 TypeScript 构建，提供全面的类型定义：

```typescript
import type {
  SiteConfig,
  ThemeConfig,
  PageData,
  Plugin
} from 'athen';
```

## 导航

探索 API 文档：

- **[站点配置](/zh/api/site-config)** - 配置您的站点
- **[主题配置](/zh/api/theme-config)** - 自定义主题
- **[Frontmatter](/zh/api/frontmatter)** - 页面级配置
- **[客户端 API](/zh/api/client-api)** - 浏览器端 API
- **[Node API](/zh/api/node-api)** - 构建时 API
- **[插件 API](/zh/api/plugin-api)** - 插件开发

## 示例

查看实用示例：

- [基础配置](/zh/examples/basic)
- [高级主题](/zh/examples/advanced)
- [插件开发](/zh/examples/plugin-development)

## TypeScript 支持

Athen 对 TypeScript 有一流的支持。所有 API 都是完全类型化的，您可以在配置文件中使用 TypeScript：

```typescript
// athen.config.ts
import { defineConfig } from 'athen';
import type { DefaultTheme } from 'athen/theme';

export default defineConfig<DefaultTheme.Config>({
  themeConfig: {
    // 完全类型化的主题配置
  }
});
```

## 需要帮助？

如果您找不到所需内容：

- 查看[示例](/zh/examples/basic)
- 浏览 [GitHub 讨论](https://github.com/your-org/your-repo/discussions)
- 加入我们的 [Discord 社区](https://discord.gg/your-server)
