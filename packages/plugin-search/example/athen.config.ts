import { defineConfig } from 'athen';

export default defineConfig({
  title: 'Athen Search Plugin Example',
  description: 'Example documentation with search functionality',
  
  // Enable search with FlexSearch
  search: {
    provider: 'flex',
    include: ['**/*.md', '**/*.mdx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    searchOptions: {
      limit: 10,
      enrich: true,
      suggest: true,
    },
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
          ],
        },
      ],
    },
  },
});
