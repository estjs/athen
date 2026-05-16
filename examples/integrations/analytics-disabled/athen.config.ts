import { defineConfig } from 'athen';

export default defineConfig({
  title: 'Analytics Disabled Preset',
  description: 'Analytics disabled configuration example.',
  analytics: false,
  themeConfig: {
    nav: [{ text: 'Analytics', link: '/' }],
  },
});
