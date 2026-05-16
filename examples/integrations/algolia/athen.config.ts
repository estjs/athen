import { defineConfig } from 'athen';

export default defineConfig({
  title: 'Algolia Search Preset',
  description: 'Algolia DocSearch configuration example.',
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
  },
  themeConfig: {
    nav: [{ text: 'Search', link: '/guide/search' }],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [{ text: 'Search', link: '/guide/search' }],
        },
      ],
    },
  },
});
