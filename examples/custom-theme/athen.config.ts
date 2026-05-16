import { defineConfig } from 'athen';

export default defineConfig({
  title: 'Custom Theme Example',
  description: 'A minimal local theme example for Athen.',
  theme: './theme',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
    ],
  },
});
