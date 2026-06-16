import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./packages/athen/src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./packages/athen/src/shared', import.meta.url)),
      '@theme-default': fileURLToPath(
        new URL('./packages/athen/src/theme-default', import.meta.url),
      ),
    },
  },
  define: {
    __DEV__: true,
  },
  test: {
    exclude: [
      '**/e2e/**', // exclude Playwright tests
      '**/node_modules/**', // exclude all node_modules
      '**/test/setup.ts', // exclude test setup files
    ],
    include: ['packages/**/test/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Measure every source module, not just those imported by a test, so
      // untested files can't silently inflate the reported percentage. Scoped
      // to `.ts` logic — `.tsx` Essor components are exercised by the Playwright
      // e2e suite, not unit tests, and can't be remapped here without a runtime.
      all: true,
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/scripts/**',
        '**/unplugin/**',
        '**/playground/**',
        '**/examples/**',
        '**/*.d.ts',
        '**/dist/**',
      ],
      thresholds: {
        statements: 55,
        branches: 55,
        functions: 55,
        lines: 55,
      },
    },
    globals: true,
    watch: false,
  },
});
