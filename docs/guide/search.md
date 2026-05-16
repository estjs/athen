# Search

The default theme of Athen has a built-in full-text search function, which has the following features:

- 👌 Out of the box, no extra configuration is required.
- 🔥 Support i18n, such as Chinese, English, Japanese, Korean, etc.
- ✅ Support full-text search of title and content.
- ⬆️ Support pressing the up and down keys on the keyboard to select the search result, and pressing the Enter key to jump to the corresponding page.
- 🚀 High performance, based on [`FlexSearch`](https://github.com/nextapps-de/flexsearch) which means the search speed is very fast, and pure client-side search, no network request.

Of course, you can also turn off the full-text search function by following config:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    search: false
  }
});
```

## Local FlexSearch

Use FlexSearch when you want a local static index with no external service:

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

Common fields:

| Field | Description |
| --- | --- |
| `provider` | Use `'flex'` for the built-in local search index. |
| `include` | Glob patterns included in the index. |
| `exclude` | Glob patterns excluded from the index. |
| `searchIndexPath` | URL where the generated search index is served. |
| `cache.enabled` | Enables client-side index caching. |
| `cache.maxAge` | Cache max age in milliseconds. |
| `searchOptions.limit` | Maximum number of results shown. |
| `searchOptions.enrich` | Includes richer result metadata. |
| `searchOptions.suggest` | Enables suggestions for partial queries. |

## Algolia

Use Algolia when you want hosted search and already have a DocSearch/Algolia index:

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

The `apiKey` should be a search-only key. Put write/admin keys only in your crawler or indexing pipeline, never in the browser bundle.

## Related Examples

- `examples/integrations` shows a local FlexSearch setup.
- `examples/integrations/algolia` shows an Algolia preset with `algoliaOptions`.
