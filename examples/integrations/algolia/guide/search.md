# Algolia Search Guide

Use Algolia when your documentation needs hosted search, crawler-backed indexing, or shared search across deployed sites.

```ts
search: {
  provider: 'algolia',
  algolia: {
    appId: 'BH4D9OD16A',
    apiKey: 'example-search-only-key',
    indexName: 'athen_example',
    algoliaOptions: {
      facetFilters: ['lang:en'],
    },
  },
}
```

The browser key should be a search-only key.
