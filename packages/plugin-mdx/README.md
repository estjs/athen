# @athen/plugin-mdx

**English** | [简体中文](./README.zh-CN.md)

MDX processing plugin for Athen - transforms Markdown and MDX files into Essor components with enhanced features.

## 📦 Installation

```bash
npm install @athen/plugin-mdx
# or
pnpm add @athen/plugin-mdx
# or
yarn add @athen/plugin-mdx
```

> **Note**: This plugin is automatically included with the main `athen` package. You typically don't need to install it separately.

## ✨ Features

- **MDX Support**: Write JSX components directly in Markdown
- **Syntax Highlighting**: Powered by Shiki with multiple themes
- **Table of Contents**: Automatic TOC generation
- **Frontmatter**: YAML frontmatter support
- **Custom Directives**: Enhanced Markdown with custom syntax
- **Code Features**: Line numbers, highlighting, copy button
- **Git Integration**: Last updated timestamps from Git history
- **Essor Components**: Full compatibility with Essor framework

## 🚀 Usage

### Basic Usage

The plugin is automatically configured when using Athen. For manual setup:

```ts
import { pluginMdx } from '@athen/plugin-mdx';

export default {
  plugins: [
    await pluginMdx({
      root: './docs',
      base: '/',
    })
  ]
};
```

### Configuration Options

```ts
interface MdxOptions {
  root?: string;           // Root directory
  base?: string;           // Base URL
  enableSpa?: boolean;     // Enable SPA mode
  essor?: boolean;         // Enable Essor compatibility
  plugins?: Plugin[];      // Additional plugins
}
```

## 📝 Markdown Features

### Frontmatter

Add metadata to your pages:

```markdown
---
title: My Page
description: A great page
layout: doc
---

# My Page Content
```

### Syntax Highlighting

Code blocks with syntax highlighting:

````markdown
```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
```
````

### Custom Directives

#### Tip Boxes

```markdown
:::tip
This is a tip message.
:::

:::warning
This is a warning message.
:::

:::danger
This is a danger message.
:::

:::info
This is an info message.
:::
```

#### Custom Containers

```markdown
:::details Click to expand
This content is hidden by default.
:::
```

### Table of Contents

Automatic TOC generation from headings:

```markdown
[[toc]]
```

### Links

Enhanced link processing:

- **Internal Links**: Automatic SPA navigation
- **External Links**: Open in new tab with security attributes
- **Asset Links**: Proper asset resolution

### Code Features

#### Line Highlighting

````markdown
```js {2,4-6}
function example() {
  const highlighted = true; // This line is highlighted
  const normal = true;
  const start = true;       // These lines
  const middle = true;      // are highlighted
  const end = true;         // as a range
}
```
````

#### Line Numbers

````markdown
```js:line-numbers
function withLineNumbers() {
  return 'Line numbers shown';
}
```
````

#### File Names

````markdown
```js title="example.js"
function example() {
  return 'File name shown in header';
}
```
````

## 🧩 MDX Components

### Using Essor Components

Import and use Essor components in your MDX:

```mdx
---
title: Component Demo
---

import { Button } from '../components/Button.tsx';
import { Counter } from '../components/Counter.tsx';

# Component Demo

Here's a button component:

<Button type="primary">Click me!</Button>

And an interactive counter:

<Counter initialValue={0} />
```

### Built-in Components

The plugin provides several built-in components:

#### CodeGroup

```mdx
<CodeGroup>
<CodeGroupItem title="npm">

```bash
npm install athen
```

</CodeGroupItem>
<CodeGroupItem title="pnpm">

```bash
pnpm add athen
```

</CodeGroupItem>
</CodeGroup>
```

## 🔧 Advanced Configuration

### Custom Remark Plugins

```ts
import { pluginMdx } from '@athen/plugin-mdx';
import remarkCustomPlugin from 'remark-custom-plugin';

export default {
  plugins: [
    await pluginMdx({
      plugins: [
        {
          name: 'custom-remark',
          plugin: remarkCustomPlugin,
          options: { /* plugin options */ }
        }
      ]
    })
  ]
};
```

### Custom Rehype Plugins

```ts
import rehypeCustomPlugin from 'rehype-custom-plugin';

export default {
  plugins: [
    await pluginMdx({
      plugins: [
        {
          name: 'custom-rehype',
          plugin: rehypeCustomPlugin,
          enforce: 'post' // Run after built-in plugins
        }
      ]
    })
  ]
};
```

### Shiki Configuration

Customize syntax highlighting:

```ts
export default {
  plugins: [
    await pluginMdx({
      shiki: {
        theme: 'dark-plus',
        langs: ['javascript', 'typescript', 'vue', 'css'],
        lineNumbers: true
      }
    })
  ]
};
```

## 🎨 Styling

### Code Block Styling

Customize code block appearance:

```css
.athen-code-block {
  --code-bg: #1e1e1e;
  --code-text: #d4d4d4;
  --code-line-highlight: rgba(255, 255, 255, 0.1);
}
```

### Tip Box Styling

```css
.tip {
  --tip-bg: #f0f9ff;
  --tip-border: #0ea5e9;
  --tip-text: #0c4a6e;
}

.warning {
  --warning-bg: #fffbeb;
  --warning-border: #f59e0b;
  --warning-text: #92400e;
}
```

## 🔌 Plugin Architecture

The MDX plugin consists of several sub-plugins:

### Core Plugins

1. **pluginMdxRollup**: Main MDX transformation using @mdx-js/rollup
2. **pluginMdxEssor**: Essor framework compatibility
3. **pluginMdxGit**: Git-based last updated timestamps
4. **pluginMdxRawContent**: Raw content extraction for search indexing

### Remark Plugins

- **remark-gfm**: GitHub Flavored Markdown
- **remark-frontmatter**: YAML frontmatter parsing
- **remark-directive**: Custom directive support
- **remark-gemoji**: Emoji support
- **remarkPluginToc**: Table of contents generation
- **remarkPluginTip**: Tip box containers
- **remarkPluginNormalizeLink**: Link normalization

### Rehype Plugins

- **rehype-slug**: Heading ID generation
- **rehype-autolink-headings**: Automatic heading links
- **rehype-external-links**: External link processing
- **rehypePluginShiki**: Syntax highlighting
- **rehypePluginPreWrapper**: Code block wrapper

## 📚 API Reference

### pluginMdx(options)

Main plugin function that returns an array of Vite plugins.

**Parameters:**
- `options` (MdxOptions): Configuration options

**Returns:**
- `Promise<Plugin[]>`: Array of Vite plugins

### MdxOptions Interface

```ts
interface MdxOptions {
  root?: string;
  base?: string;
  enableSpa?: boolean;
  essor?: boolean;
  plugins?: Array<{
    name: string;
    plugin: any;
    options?: any;
    enforce?: 'pre' | 'post';
  }>;
  shiki?: {
    theme?: string;
    langs?: string[];
    lineNumbers?: boolean;
  };
}
```

## 🔗 Related

- [MDX Documentation](https://mdxjs.com/)
- [Shiki Syntax Highlighter](https://shiki.matsu.io/)
- [Remark Plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- [Rehype Plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md)

## 📄 License

MIT © [estjs](https://github.com/estjs)
