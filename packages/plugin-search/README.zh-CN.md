# @athen/plugin-search

为 Athen 文档框架提供的强大搜索插件，支持本地 FlexSearch 和云端 Algolia 搜索。

## 特性

- 🔍 **双搜索提供商**: 支持 FlexSearch（本地）和 Algolia（云端）
- 🌏 **多语言支持**: 内置支持中日韩（CJK）语言
- ⚡ **快速索引**: 高效的文档索引，支持 frontmatter
- 🎨 **可定制**: 灵活的配置选项和主题
- 📱 **移动友好**: 响应式设计，支持键盘快捷键
- 🔧 **易于集成**: 与 Athen 框架简单集成

## 工作原理

插件的工作流程：

1. **索引构建**: 构建时扫描 markdown 文件并创建搜索索引
2. **服务提供**: 开发时通过中间件提供搜索索引；生产时生成静态 JSON 文件
3. **搜索执行**: 客户端组件获取搜索索引并使用 FlexSearch 或 Algolia 执行搜索
4. **主题集成**: 搜索组件与 Athen 主题系统无缝集成

## 安装

```bash
npm install @athen/plugin-search
```

## 使用方法

### 基础设置

在你的 `athen.config.ts` 中添加插件：

```typescript
import { defineConfig } from 'athen';
import searchPlugin from '@athen/plugin-search';

export default defineConfig({
  plugins: [
    searchPlugin({
      provider: 'flex', // 或 'algolia'
    }),
  ],
});
```

### FlexSearch 配置

```typescript
searchPlugin({
  provider: 'flex',
  include: ['**/*.md', '**/*.mdx'],
  exclude: ['**/node_modules/**', '**/dist/**'],
  searchOptions: {
    limit: 10,
    enrich: true,
    suggest: true,
  },
})
```

### Algolia 配置

```typescript
searchPlugin({
  provider: 'algolia',
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
    algoliaOptions: {
      hitsPerPage: 10,
    },
  },
})
```

### 主题集成

插件会自动与 Athen 的默认主题集成。搜索组件将出现在导航栏中。

对于自定义主题，导入并使用 SearchBox 组件：

```tsx
import { SearchBox } from '@athen/plugin-search/client';

export function MyCustomSearch() {
  return (
    <SearchBox
      provider="flex"
      placeholder="搜索文档..."
      langRoutePrefix="/zh"
    />
  );
}
```

## 配置选项

### SearchOptions

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `provider` | `'flex' \| 'algolia'` | `'flex'` | 使用的搜索提供商 |
| `include` | `string[]` | `['**/*.md', '**/*.mdx']` | 要包含的文件 glob 模式 |
| `exclude` | `string[]` | `[]` | 要排除的文件 glob 模式 |
| `searchIndexPath` | `string` | `'/search-index'` | 搜索索引文件路径 |
| `searchOptions` | `object` | 见下文 | FlexSearch 配置 |
| `algolia` | `AlgoliaOptions` | - | Algolia 配置 |
| `transformResult` | `function` | - | 转换搜索结果的函数 |

### FlexSearch 选项

```typescript
{
  limit: 7,        // 最大结果数量
  enrich: true,    // 在结果中包含文档数据
  suggest: true,   // 启用搜索建议
}
```

### Algolia 选项

```typescript
{
  appId: string;           // Algolia 应用 ID
  apiKey: string;          // Algolia 搜索 API 密钥
  indexName: string;       // Algolia 索引名称
  algoliaOptions?: {       // 额外的 Algolia 搜索选项
    hitsPerPage?: number;
    // ... 其他 Algolia 选项
  };
}
```

## 文档 Frontmatter

插件支持 markdown 文件中的 frontmatter：

```markdown
---
title: 自定义页面标题
description: 用于搜索的页面描述
tags: [指南, 教程]
---

# 页面内容

你的 markdown 内容...
```

## 键盘快捷键

- `Cmd/Ctrl + K`: 打开搜索
- `↑/↓`: 导航结果
- `Enter`: 跳转到选中结果
- `Escape`: 关闭搜索

## 样式定制

插件包含与 Athen 主题系统集成的默认 CSS。你可以通过覆盖 CSS 变量来自定义外观：

```css
:root {
  --search-bg: var(--vp-c-bg-alt);
  --search-border: var(--vp-c-border);
  --search-text: var(--vp-c-text-1);
}
```

## API 参考

### SearchBox 组件

```tsx
interface SearchBoxProps {
  provider?: 'flex' | 'algolia';
  placeholder?: string;
  algolia?: AlgoliaConfig;
  langRoutePrefix?: string;
}
```

### SearchIndexBuilder

```typescript
class SearchIndexBuilder {
  constructor(options?: SearchOptions);
  addDocument(filePath: string, content: string): void;
  addDocumentsFromDirectory(dir: string, baseDir?: string): void;
  search(query: string): Promise<SearchResult[]>;
  generateSearchIndex(): string;
}
```

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建包
npm run build

# 类型检查
npm run typecheck
```

## 许可证

MIT 许可证 - 详见 [LICENSE](../../LICENSE) 文件。
