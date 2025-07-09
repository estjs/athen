import { defineConfig } from 'vitest/config';
export default defineConfig({
  define: {
    __DEV__: true,
  },
  test: {
    exclude: [
      '**/e2e/**', // exclude Playwright tests
    ],
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
      lines: 80,
      functions: 80,
      branches: 80,
    },
    globals: true,
    watch: false,
  },
});
