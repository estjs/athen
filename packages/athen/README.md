# Athen

**English** | [简体中文](./README.zh-CN.md)

The core framework package for Athen - a modern documentation framework built on Essor and Vite.

## 📦 Installation

```bash
npm install athen
# or
pnpm add athen
# or
yarn add athen
```

## 🚀 Quick Start

### 1. Create a new project

```bash
npx create-athen my-docs
cd my-docs
```

### 2. Start development server

```bash
pnpm dev
```

### 3. Build for production

```bash
pnpm build
```

## 📖 Usage

### Configuration

Create an `athen.config.ts` file in your project root:

```ts
import { defineConfig } from "athen";

export default defineConfig({
  title: "My Documentation",
  description: "A modern documentation site",
  lang: "en-US",
  base: "/",

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/" },
            { text: "Installation", link: "/guide/installation" },
          ],
        },
      ],
    },

    links: [{ icon: "github", link: "https://github.com/your/repo" }],
  },

  // Multi-language support
  locales: {
    "/zh/": {
      lang: "zh-CN",
      title: "我的文档",
      themeConfig: {
        nav: [{ text: "指南", link: "/zh/guide/" }],
      },
    },
  },
});
```

### CLI Commands

Athen provides a powerful CLI for development and building:

```bash
# Start development server
athen dev [root]

# Build for production
athen build [root]

# Preview production build
athen preview [root]
```

### Project Structure

```
my-docs/
├── docs/              # Your content files
│   ├── guide/
│   │   ├── index.md
│   │   └── installation.md
│   └── api/
│       └── index.md
├── public/            # Static assets
├── athen.config.ts    # Configuration file
└── package.json
```

## ✨ Features

### Built on Essor Framework

Athen leverages the modern [Essor](https://github.com/estjs/essor) reactive framework:

- **Reactive Components**: Use Essor's reactive system with JSX
- **Client-side Routing**: Powered by [Essor-Router](https://github.com/estjs/essor-router)
- **Component Composition**: Import and use Essor components in your docs

### Convention-based Routing

- **Automatic Routing**: Files in `docs/` become routes automatically
- **Dynamic Imports**: Code splitting and lazy loading out of the box
- **Nested Routes**: Support for complex navigation structures

### MDX Support

- **Markdown + JSX**: Write content in Markdown with embedded components
- **Syntax Highlighting**: Powered by Shiki with multiple themes
- **Remark/Rehype Plugins**: Extensible content processing pipeline

### Theme System

- **Default Theme**: Beautiful, responsive theme included
- **Customizable**: Override components and styles easily
- **Slots API**: Inject custom components without replacing the entire theme

### Plugin Ecosystem

- **Built-in Plugins**: Search, analytics, MDX processing, and more
- **Vite Compatible**: Use any Vite plugin
- **Custom Plugins**: Create your own plugins with the plugin API

## 🔧 Configuration Options

### Site Configuration

| Option        | Type     | Default   | Description      |
| ------------- | -------- | --------- | ---------------- |
| `title`       | `string` | -         | Site title       |
| `description` | `string` | -         | Site description |
| `lang`        | `string` | `'en-US'` | Site language    |
| `base`        | `string` | `'/'`     | Base URL         |
| `srcDir`      | `string` | `'docs'`  | Source directory |
| `outDir`      | `string` | `'dist'`  | Output directory |

### Theme Configuration

| Option     | Type         | Description                      |
| ---------- | ------------ | -------------------------------- |
| `nav`      | `NavItem[]`  | Navigation menu items            |
| `sidebar`  | `Sidebar`    | Sidebar navigation               |
| `links`    | `IconLink[]` | Navbar social and external links |
| `footer`   | `Footer`     | Footer configuration             |
| `editLink` | `EditLink`   | Edit page links                  |

### Advanced Configuration

```ts
export default defineConfig({
  // Vite configuration
  vite: {
    // Any Vite config options
  },

  // Custom plugins
  plugins: [
    // Add your plugins here
  ],

  // Search configuration
  search: {
    provider: "flex", // or 'algolia'
    // FlexSearch options...
  },

  // Analytics
  analytics: {
    google: "G-XXXXXXXXXX",
  },
});
```

## 🎨 Theming

### Using the Default Theme

The default theme provides a clean, modern interface with:

- Responsive design
- Dark/light mode toggle
- Mobile-friendly navigation
- Search functionality
- Multi-language support

### Customizing Styles

Override theme styles using CSS variables:

```css
:root {
  --at-primary-color: #3b82f6;
  --at-text-color: #374151;
  --at-bg-color: #ffffff;
}
```

### Custom Components

Replace theme components by creating files in your project:

```
.athen/
└── theme/
    ├── Layout.tsx      # Main layout
    ├── NavBar.tsx      # Navigation bar
    └── SideBar.tsx     # Sidebar
```

### Slots API

Inject custom components without replacing the entire theme:

```ts
export default defineConfig({
  themeConfig: {
    slots: {
      banner: () => <div class="announcement">New version available!</div>,
      sidebarExtra: () => <AdWidget />,
      footerExtra: () => <CustomFooter />
    }
  }
});
```

## 🔌 Plugin Development

Create custom plugins using the Vite plugin API:

```ts
import type { Plugin } from "vite";

export function myAthenPlugin(): Plugin {
  return {
    name: "my-athen-plugin",
    // Plugin implementation
  };
}
```

Use in your config:

```ts
export default defineConfig({
  plugins: [myAthenPlugin()],
});
```

## 🌍 Internationalization

### Multi-language Setup

```ts
export default defineConfig({
  locales: {
    "/": {
      lang: "en-US",
      title: "My Docs",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "我的文档",
    },
    "/ja/": {
      lang: "ja-JP",
      title: "私のドキュメント",
    },
  },
});
```

### Directory Structure

```
docs/
├── index.md           # English home
├── guide/
│   └── index.md
├── zh/
│   ├── index.md       # Chinese home
│   └── guide/
│       └── index.md
└── ja/
    ├── index.md       # Japanese home
    └── guide/
        └── index.md
```

## 📚 API Reference

### defineConfig

```ts
function defineConfig(config: UserConfig): UserConfig;
```

Define your Athen configuration with full TypeScript support.

### CLI API

The CLI provides programmatic access to Athen's functionality:

```ts
import { build, createDevServer } from "athen";

// Start dev server
const server = await createDevServer("./docs");
await server.listen();

// Build for production
await build("./docs");
```

## 🔗 Related Packages

- [`@estjs/athen-plugin-mdx`](../plugin-mdx) - MDX processing plugin
- [`@estjs/athen-plugin-search`](../plugin-search) - Full-text search plugin
- [`@estjs/athen-plugin-analytics`](../plugin-analytics) - Analytics integration
- [`create-athen`](../create-athen) - Project scaffolding tool

## 📄 License

MIT © [estjs](https://github.com/estjs)
