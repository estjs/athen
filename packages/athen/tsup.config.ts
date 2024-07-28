import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/node/cli.ts',
    dev: 'src/node/dev.ts',
    index: 'src/node/index.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  dts: true,
  format: ['cjs', 'esm'],
  splitting: true,
  skipNodeModulesBundle: true,
  outDir: 'dist',
  clean: true,
  tsconfig: './tsconfig.json',
});
