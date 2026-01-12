# Getting Started

This guide will walk you through creating your first Athen documentation site.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** version 18 or higher
- **npm**, **yarn**, or **pnpm** package manager
- A text editor (VS Code recommended)

## Installation

### Option 1: Using create-athen (Recommended)

The fastest way to get started is using the `create-athen` scaffolding tool:

```bash
# Using npm
npm create athen@latest my-docs

# Using yarn
yarn create athen my-docs

# Using pnpm
pnpm create athen my-docs
```

### Option 2: Manual Installation

You can also set up Athen manually:

```bash
# Create project directory
mkdir my-docs && cd my-docs

# Initialize package.json
npm init -y

# Install Athen
npm install athen

# Create docs directory
mkdir docs
```

## Project Structure

After installation, your project structure should look like this:

```
my-docs/
├── docs/
│   ├── guide/
│   │   └── getting-started.md
│   ├── api/
│   │   └── introduction.md
│   ├── public/
│   │   └── logo.svg
│   ├── athen.config.ts
│   └── index.md
├── package.json
└── README.md
```

## Configuration

The `athen.config.ts` file is where you configure your site:

```typescript
import { defineConfig } from 'athen';

export default defineConfig({
  title: 'My Documentation',
  description: 'My awesome documentation site',
  
  // Enable search
  search: {
    provider: 'flex'
  },
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/introduction' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        }
      ]
    }
  }
});
```

## Development

Start the development server:

```bash
npm run dev
```

Your site will be available at `http://localhost:5173`.

## Writing Content

### Basic Markdown

Create content using standard Markdown syntax:

```markdown
# Page Title

This is a paragraph with **bold** and *italic* text.

## Code Examples

\`\`\`javascript
function hello() {
  console.log('Hello, Athen!');
}
\`\`\`

## Lists

- Item 1
- Item 2
- Item 3
```

### Frontmatter

Add metadata to your pages using frontmatter:

```markdown
---
title: Custom Page Title
description: Page description for SEO
sidebar: false
---

# Page Content
```

### Links

Link to other pages in your documentation:

```markdown
[Getting Started](/guide/getting-started)
[API Reference](/api/introduction)
```

## Building for Production

When you're ready to deploy:

```bash
npm run build
```

This generates a `dist` directory with your static site.

## Next Steps

Now that you have a basic site running:

1. [Configure your site](/guide/configuration) - Customize navigation, sidebar, and more
2. [Learn about Markdown features](/guide/markdown) - Discover advanced Markdown capabilities
3. [Set up search](/guide/search) - Enable powerful search functionality
4. [Add internationalization](/guide/i18n) - Support multiple languages
5. [Deploy your site](/guide/deployment) - Get your docs online

## Need Help?

- Check out our [examples](/examples/basic)
- Join our [Discord community](https://discord.gg/your-server)
- Browse [GitHub discussions](https://github.com/your-org/your-repo/discussions)
