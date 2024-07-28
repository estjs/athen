import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/node/cli.ts',
    dev: 'src/node/dev.ts',
    index: 'src/node/index.ts',
  },
  outDir: 'dist',
  format: ['cjs', 'esm'],
  target: 'esnext',
  dts: true,
  shims: true,
  clean: true,
  treeshake: true,
  cjsInterop: true,
  minify: process.env.NODE_ENV === 'production',
  skipNodeModulesBundle: true,
});
