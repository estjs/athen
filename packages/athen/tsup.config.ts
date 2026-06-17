import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/node/cli.ts',
    dev: 'src/node/dev.ts',
    index: 'src/node/index.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  dts: {
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  format: ['cjs', 'esm'],
  splitting: true,
  skipNodeModulesBundle: true,
  outDir: 'dist',
  clean: true,
  external: [
    '@estjs/athen-plugin-mdx',
    '@estjs/athen-plugin-search',
    '@estjs/athen-plugin-analytics',
  ],
  esbuildPlugins: [
    {
      name: 'external-athen-plugins',
      setup(build) {
        build.onResolve({ filter: /^@estjs\/athen-plugin-/ }, (args) => {
          return { path: args.path, external: true };
        });
      },
    },
  ],
  tsconfig: './tsconfig.json',
});
