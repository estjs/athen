import process from 'node:process';
import { defineConfig } from 'tsup';
export default defineConfig([
  {
    entry: ['src/index.ts'],
    minifyIdentifiers: false,
    bundle: true,
    dts: {
      compilerOptions: {
        ignoreDeprecations: '6.0',
      },
    },
    sourcemap: true,
    splitting: true,
    format: ['cjs', 'esm'],
    minify: process.env.NODE_ENV === 'production',
    skipNodeModulesBundle: true,
    outDir: 'dist',
    clean: true,
  },
]);
