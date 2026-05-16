# Search Guide

## Local Index

FlexSearch builds an index from Markdown and MDX files during build.

Try searching for `local index` or `configuration`.

```ts
search: {
  provider: 'flex',
  include: ['**/*.md', '**/*.mdx'],
  exclude: ['algolia/**', 'analytics-disabled/**', 'drafts/**', '**/node_modules/**', '**/dist/**'],
  cache: {
    enabled: true,
    maxAge: 60 * 60 * 1000,
  },
  searchOptions: {
    limit: 8,
    enrich: true,
    suggest: true,
  },
}
```

## Algolia Preset

Use Algolia when your documentation needs hosted search, crawler-backed indexing, or shared search across deployed sites.

The copyable preset lives at `examples/integrations/algolia/athen.config.ts`.

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

## What This Covers

- `provider: 'flex'` keeps search local and static.
- `include` and `exclude` control which docs enter the index.
- `cache.enabled` lets the browser reuse the index between visits.
- `provider: 'algolia'` selects the hosted search provider.
- `algoliaOptions` is forwarded to the Algolia client.
