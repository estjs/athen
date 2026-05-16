# 全文搜索

Athen 默认主题内置了全文搜索功能，拥有如下特性：

- 👌 开箱即用，无需额外配置；
- 🔥 支持多语言搜索，如中文、英文、日文、韩文等；
- ✅ 支持标题、内容的全文搜索；
- ⬆️ 支持按键盘上下键选择搜索结果，按回车键跳转到对应页面；
- 🚀 高性能，基于 [`FlexSearch`](https://github.com/nextapps-de/flexsearch) 的纯客户端实现，零网络 IO 开销。

当然，你也可以通过配置关闭全文搜索功能:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    search: false
  }
});
```

## 本地 FlexSearch

如果你希望使用纯本地静态索引，不依赖外部服务，可以使用 FlexSearch：

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  search: {
    provider: 'flex',
    include: ['**/*.md', '**/*.mdx'],
    exclude: ['drafts/**', '**/node_modules/**', '**/dist/**'],
    searchIndexPath: '/search-index',
    cache: {
      enabled: true,
      maxAge: 60 * 60 * 1000
    },
    searchOptions: {
      limit: 8,
      enrich: true,
      suggest: true
    }
  },
  themeConfig: {
    search: true
  }
});
```

常用字段说明：

| 字段 | 说明 |
| --- | --- |
| `provider` | 设置为 `'flex'` 表示使用内置本地搜索索引。 |
| `include` | 进入索引的文件 glob。 |
| `exclude` | 排除出索引的文件 glob。 |
| `searchIndexPath` | 生成的搜索索引访问路径。 |
| `cache.enabled` | 是否开启客户端索引缓存。 |
| `cache.maxAge` | 缓存有效期，单位毫秒。 |
| `searchOptions.limit` | 最大结果数量。 |
| `searchOptions.enrich` | 是否返回更丰富的结果元信息。 |
| `searchOptions.suggest` | 是否开启部分查询建议。 |

## Algolia

如果你已经有 DocSearch/Algolia 索引，或希望使用托管搜索，可以使用 Algolia：

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  search: {
    provider: 'algolia',
    algolia: {
      appId: 'BH4D9OD16A',
      apiKey: 'example-search-only-key',
      indexName: 'athen_example',
      algoliaOptions: {
        facetFilters: ['lang:en']
      }
    }
  }
});
```

`apiKey` 应使用 search-only key。写入或管理权限的 key 只应放在爬虫/建索引流程中，不能放进浏览器产物。

## 相关示例

- `examples/integrations` 展示本地 FlexSearch 配置。
- `examples/integrations/algolia` 展示包含 `algoliaOptions` 的 Algolia preset。
