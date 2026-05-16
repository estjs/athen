import { defineConfig } from 'athen';
import { examplePlugin } from './plugins/examplePlugin';

export default defineConfig({
  title: 'Integrations Example',
  description: 'Search, analytics, and plugin integrations in one example.',
  exclude: ['plugins/**', 'algolia/**', 'analytics-disabled/**'],
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
  },
  analytics: {
    google: { id: 'G-ATHENEXAMPLE' },
    plausible: { domain: 'docs.example.com' },
    umami: {
      id: 'umami-example-id',
      src: 'https://analytics.example.com/script.js',
    },
    custom: {
      snippet: 'window.__CUSTOM_ANALYTICS_EXAMPLE__ = "custom analytics example";',
    },
  },
  plugins: [
    examplePlugin({
      message: 'Loaded from virtual:athen-example-plugin',
      htmlMessage: 'Plugin data injected into HTML',
    }),
  ],
  themeConfig: {
    nav: [
      { text: 'Search', link: '/guide/search' },
      { text: 'Analytics', link: '/guide/analytics' },
      { text: 'Plugin', link: '/guide/plugin' },
      { text: 'Presets', link: '/guide/presets' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Integrations',
          items: [
            { text: 'Search', link: '/guide/search' },
            { text: 'Analytics', link: '/guide/analytics' },
            { text: 'Plugin', link: '/guide/plugin' },
            { text: 'Preset Configs', link: '/guide/presets' },
          ],
        },
      ],
    },
  },
});
