import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['vite', 'flexsearch', 'markdown-it', 'glob-to-regexp'],
});
