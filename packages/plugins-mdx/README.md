# plugins-mdx

[![NPM version](https://img.shields.io/npm/v/plugins-mdx?color=a1b858&label=)](https://www.npmjs.com/plugins-mdx)

### A mdx plugin collection for plugins

```warn
仅支持vite
```

## 安装

```bash
npm i -D plugins-mdx
```

## 使用

```js
import { defineConfig } from 'vite'
import mdx from 'plugins-mdx'

export default defineConfig({
  plugins: [
    mdx()
  ]
})
```

## 选项

```ts
export interface options {
  /**
   * root path
   */
  root: string;
  /**
   * Base path of the site.
   */
  base: string;
  /**
   * Enable single page application in production.
   */
  enableSpa?: boolean;
  /**
   * Whether to fail builds when there are dead links.
   */
  allowDeadLinks?: boolean;
  /**
   * vite plugin array
   */
  plugins: Plugin[];
}
```
