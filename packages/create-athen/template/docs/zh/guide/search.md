# 搜索功能

Athen 提供强大的内置搜索功能，帮助用户快速找到所需内容。

## 概述

搜索功能包括：

- **全文搜索** 覆盖所有文档内容
- **多语言支持** 针对中日韩（CJK）语言优化
- **即时结果** 支持模糊匹配
- **键盘快捷键** 快速访问
- **可定制** 搜索选项和界面

## 配置

### 基础设置

在 `athen.config.ts` 中启用搜索：

```typescript
import { defineConfig } from 'athen';

export default defineConfig({
  // 启用本地搜索（推荐）
  search: {
    provider: 'flex'
  },
  
  // 或使用 Algolia 云搜索
  // search: {
  //   provider: 'algolia',
  //   algolia: {
  //     appId: 'YOUR_APP_ID',
  //     apiKey: 'YOUR_SEARCH_API_KEY',
  //     indexName: 'YOUR_INDEX_NAME'
  //   }
  // }
});
```

### 高级配置

更精细地控制搜索行为：

```typescript
export default defineConfig({
  search: {
    provider: 'flex',
    
    // 包含在搜索索引中的文件
    include: ['**/*.md', '**/*.mdx'],
    
    // 从搜索索引中排除的文件
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // 搜索选项
    searchOptions: {
      limit: 10,        // 显示的最大结果数
      enrich: true,     // 包含文档元数据
      suggest: true,    // 启用搜索建议
    },
    
    // 自定义结果转换
    transformResult: (results) => {
      return results.map(result => ({
        ...result,
        // 自定义结果处理
      }));
    }
  }
});
```

## 搜索提供商

### FlexSearch（本地）

FlexSearch 提供客户端搜索，性能优异：

**优点：**
- 无外部依赖
- 离线工作
- 快速轻量
- 适合小到中型站点
- 多语言支持

**缺点：**
- 索引大小随内容增长
- 仅限客户端处理

### Algolia（云端）

Algolia 提供强大的云端搜索：

**优点：**
- 极快的搜索速度
- 高级分析功能
- 容错能力
- 分面搜索
- 可扩展到任何规模

**缺点：**
- 需要外部服务
- 基于使用量的定价
- 需要网络连接

## 使用方法

### 键盘快捷键

- **Cmd/Ctrl + K**: 打开搜索模态框
- **↑/↓**: 导航结果
- **Enter**: 跳转到选中结果
- **Escape**: 关闭搜索

### 搜索语法

搜索支持多种查询类型：

```
# 基础搜索
快速开始

# 短语搜索
"精确短语"

# 多个词条
配置 设置

# 排除词条
javascript -node
```

## 自定义

### 主题集成

搜索组件与您的主题无缝集成：

```typescript
// 在主题配置中
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '重置搜索',
            footer: {
              selectText: '选择',
              navigateText: '导航',
              closeText: '关闭'
            }
          }
        }
      }
    }
  }
});
```

### 自定义搜索组件

对于高级自定义，您可以创建自定义搜索组件：

```tsx
import { SearchBox } from '@athen/plugin-search/client';

export function CustomSearch() {
  return (
    <SearchBox
      provider="flex"
      placeholder="搜索文档..."
      className="custom-search"
    />
  );
}
```

## 多语言搜索

Athen 的搜索自动处理多种语言：

```typescript
export default defineConfig({
  search: {
    provider: 'flex',
    // 自动检测并索引不同语言的内容
    // 针对中日韩（CJK）语言优化
  },
  
  themeConfig: {
    locales: {
      '/': { lang: 'en-US' },
      '/zh/': { lang: 'zh-CN' },
      '/ja/': { lang: 'ja-JP' }
    }
  }
});
```

## 性能提示

1. **优化内容**: 保持页面专注和结构良好
2. **使用排除**: 从索引中排除不必要的文件
3. **限制结果**: 设置适当的结果限制
4. **考虑 Algolia**: 对于大型站点，考虑云搜索

## 故障排除

### 搜索不工作？

1. 检查配置中是否启用了搜索
2. 验证 `include`/`exclude` 中的文件模式
3. 检查浏览器控制台是否有错误
4. 确保内容已正确索引

### 搜索结果不佳？

1. 使用清晰的标题改善内容结构
2. 在内容中添加相关关键词
3. 使用描述性的标题和描述
4. 考虑自定义结果转换

### 性能问题？

1. 减少索引文件数量
2. 优化内容大小
3. 对于大型站点考虑使用 Algolia
4. 实现结果分页

## 示例

查看这些搜索实现：

- [基础搜索设置](/zh/examples/basic)
- [多语言搜索](/zh/examples/i18n)
- [自定义搜索界面](/zh/examples/custom-search)

## API 参考

详细的 API 文档，请参见：

- [搜索配置](/zh/api/search-config)
- [搜索组件](/zh/api/search-components)
- [插件 API](/zh/api/plugin-api)
