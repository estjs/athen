import { defineConfig } from 'vitest/config';
export default defineConfig({
  define: {
    __DEV__: true,
  },
  test: {
    exclude: [
      '**/e2e/**', // exclude Playwright tests
      '**/node_modules/**', // exclude all node_modules
      '**/test/setup.ts', // exclude test setup files
    ],
    include:['packages/**/test/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/scripts/**',
        '**/unplugin/**',
        '**/playground/**',
        '**/examples/**',
        '**/*.d.ts',
        '**/dist/**',
      ],
    },
    globals: true,
    watch: false,
  },
});
