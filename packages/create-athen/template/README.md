# My Athen Site

A documentation site built with [Athen](https://github.com/estjs/athen).

## Features

- 🚀 **Fast & Lightweight** - Built with modern web technologies
- 🔍 **Powerful Search** - Built-in full-text search with multi-language support
- 🌍 **Internationalization** - Support for multiple languages out of the box
- 📝 **Markdown & MDX** - Write content in Markdown or use MDX for interactive components
- 🎨 **Customizable Theme** - Flexible theming with dark mode support
- 📱 **Mobile Responsive** - Optimized for all devices

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your site.

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── docs/
│   ├── guide/           # Guide documentation
│   ├── api/             # API documentation
│   ├── examples/        # Examples and tutorials
│   ├── zh/              # Chinese documentation
│   ├── public/          # Static assets
│   ├── athen.config.ts  # Site configuration
│   └── index.md         # Home page
├── package.json
└── README.md
```

## Configuration

The site is configured in `docs/athen.config.ts`. Key features:

- **Search**: Local FlexSearch enabled by default
- **Multi-language**: English and Chinese support
- **Navigation**: Organized guide, API, and examples sections
- **Theme**: Customizable with nav links and footer

## Writing Content

### Pages

Create new pages by adding Markdown files:

```markdown
---
title: Page Title
description: Page description for SEO
---

# Page Content

Your content here...
```

### Navigation

Update navigation in `athen.config.ts`:

```typescript
{
  [
    { text: "Guide", link: "/guide/getting-started" },
    { text: "API", link: "/api/introduction" },
  ];
}
```

### Sidebar

Configure sidebar for different sections:

```typescript
sidebar: {
  '/guide/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'Introduction', link: '/guide/introduction' }
      ]
    }
  ]
}
```

## Customization

### Styling

Add custom styles in your theme or component files.

### Components

Create reusable components for enhanced content.

### Plugins

Extend functionality with Athen plugins:

- Search plugin (included)
- Analytics plugin
- Custom plugins

## Deployment

### Static Hosting

Deploy to any static hosting service:

1. Run `npm run build`
2. Upload the `dist/` folder

### Popular Platforms

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Use GitHub Actions for automatic deployment
- **Cloudflare Pages**: Connect your repository

### GitHub Actions Example

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Learn More

- [Athen Documentation](https://athen.dev)
- [GitHub Repository](https://github.com/estjs/athen)
- [Examples](./docs/examples/basic.md)

## License

MIT
