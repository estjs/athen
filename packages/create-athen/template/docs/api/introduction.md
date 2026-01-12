# API Introduction

Welcome to the Athen API documentation. This section covers all the configuration options, runtime APIs, and plugin development interfaces available in Athen.

## Overview

Athen provides several types of APIs:

### Configuration APIs
- **Site Configuration**: Basic site settings and metadata
- **Theme Configuration**: Navigation, sidebar, and theme customization
- **Plugin Configuration**: Plugin-specific settings and options

### Runtime APIs
- **Client APIs**: Browser-side functionality and utilities
- **Node APIs**: Build-time and server-side functionality
- **Plugin APIs**: Interfaces for plugin development

### Component APIs
- **Built-in Components**: Ready-to-use components
- **Theme Components**: Customizable theme elements
- **Plugin Components**: Components provided by plugins

## Quick Reference

### Site Config

```typescript
import { defineConfig } from 'athen';

export default defineConfig({
  title: 'My Site',
  description: 'Site description',
  base: '/',
  
  // Search configuration
  search: {
    provider: 'flex'
  },
  
  // Theme configuration
  themeConfig: {
    nav: [...],
    sidebar: {...}
  }
});
```

### Runtime API

```typescript
import { usePageData, useRouter } from 'athen/client';

// Get page data
const { page, site } = usePageData();

// Get router instance
const router = useRouter();
```

### Plugin Development

```typescript
import type { Plugin } from 'athen';

export function myPlugin(options = {}): Plugin {
  return {
    name: 'my-plugin',
    configResolved(config) {
      // Plugin logic
    }
  };
}
```

## Type Definitions

Athen is built with TypeScript and provides comprehensive type definitions:

```typescript
import type {
  SiteConfig,
  ThemeConfig,
  PageData,
  Plugin
} from 'athen';
```

## Navigation

Explore the API documentation:

- **[Site Config](/api/site-config)** - Configure your site
- **[Theme Config](/api/theme-config)** - Customize the theme
- **[Frontmatter](/api/frontmatter)** - Page-level configuration
- **[Client API](/api/client-api)** - Browser-side APIs
- **[Node API](/api/node-api)** - Build-time APIs
- **[Plugin API](/api/plugin-api)** - Plugin development

## Examples

Check out practical examples:

- [Basic configuration](/examples/basic)
- [Advanced theming](/examples/advanced)
- [Plugin development](/examples/plugin-development)

## TypeScript Support

Athen has first-class TypeScript support. All APIs are fully typed, and you can use TypeScript in your configuration files:

```typescript
// athen.config.ts
import { defineConfig } from 'athen';
import type { DefaultTheme } from 'athen/theme';

export default defineConfig<DefaultTheme.Config>({
  themeConfig: {
    // Fully typed theme configuration
  }
});
```

## Need Help?

If you can't find what you're looking for:

- Check the [examples](/examples/basic)
- Browse [GitHub discussions](https://github.com/your-org/your-repo/discussions)
- Join our [Discord community](https://discord.gg/your-server)
