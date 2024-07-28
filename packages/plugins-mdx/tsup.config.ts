import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  target: 'es2016',
  dts: true,
  shims: true,
  clean: true,
  treeshake: true,
  tsconfig: './tsconfig.json',
  cjsInterop: true,
  minify: true,
  external: [
    '@mdx-js/mdx',
    '@mdx-js/rollup',
    'acorn',
    'fs-extra',
    'github-slugger',
    'hast-util-from-html',
    'mdast-util-mdxjs-esm',
    'rehype-autolink-headings',
    'rehype-external-links',
    'rehype-parse',
    'rehype-slug',
    'rehype-stringify',
    'remark-directive',
    'remark-frontmatter',
    'remark-gemoji',
    'remark-gfm',
    'remark-mdx-frontmatter',
    'simple-git',
    'unified',
    'shiki',
    'unist-util-visit',
    'unist-util-visit-children',
  ],
});
