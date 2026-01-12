# @athen/plugin-search

A powerful search plugin for Athen documentation framework that supports both local FlexSearch and cloud-based Algolia search.

## Features

- 🔍 **Dual Search Providers**: Support for both FlexSearch (local) and Algolia (cloud)
- 🌏 **Multi-language Support**: Built-in support for CJK (Chinese, Japanese, Korean) languages
- ⚡ **Fast Indexing**: Efficient document indexing with frontmatter support
- 🎨 **Customizable**: Flexible configuration options and theming
- 📱 **Mobile Friendly**: Responsive design with keyboard shortcuts
- 🔧 **Easy Integration**: Simple setup with Athen framework

## How It Works

The plugin works by:

1. **Indexing**: During build time, it scans your markdown files and creates a search index
2. **Serving**: In development, it serves the search index via middleware; in production, it generates a static JSON file
3. **Searching**: The client-side components fetch the search index and perform searches using FlexSearch or Algolia
4. **Integration**: The search component integrates seamlessly with Athen's theme system

## Installation

```bash
npm install @athen/plugin-search
```

## Usage

### Basic Setup

Add the plugin to your `athen.config.ts`:

```typescript
import { defineConfig } from 'athen';
import searchPlugin from '@athen/plugin-search';

export default defineConfig({
  plugins: [
    searchPlugin({
      provider: 'flex', // or 'algolia'
    }),
  ],
});
```

### FlexSearch Configuration

```typescript
searchPlugin({
  provider: 'flex',
  include: ['**/*.md', '**/*.mdx'],
  exclude: ['**/node_modules/**', '**/dist/**'],
  searchOptions: {
    limit: 10,
    enrich: true,
    suggest: true,
  },
})
```

### Algolia Configuration

```typescript
searchPlugin({
  provider: 'algolia',
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
    algoliaOptions: {
      hitsPerPage: 10,
    },
  },
})
```

### Theme Integration

The plugin automatically integrates with Athen's default theme. The search component will appear in the navigation bar.

For custom themes, import and use the SearchBox component:

```tsx
import { SearchBox } from '@athen/plugin-search/client';

export function MyCustomSearch() {
  return (
    <SearchBox
      provider="flex"
      placeholder="Search documentation..."
      langRoutePrefix="/en"
    />
  );
}
```

## Configuration Options

### SearchOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `'flex' \| 'algolia'` | `'flex'` | Search provider to use |
| `include` | `string[]` | `['**/*.md', '**/*.mdx']` | Glob patterns for files to include |
| `exclude` | `string[]` | `[]` | Glob patterns for files to exclude |
| `searchIndexPath` | `string` | `'/search-index'` | Path for the search index file |
| `searchOptions` | `object` | See below | FlexSearch configuration |
| `algolia` | `AlgoliaOptions` | - | Algolia configuration |
| `transformResult` | `function` | - | Function to transform search results |

### FlexSearch Options

```typescript
{
  limit: 7,        // Maximum number of results
  enrich: true,    // Include document data in results
  suggest: true,   // Enable search suggestions
}
```

### Algolia Options

```typescript
{
  appId: string;           // Algolia application ID
  apiKey: string;          // Algolia search API key
  indexName: string;       // Algolia index name
  algoliaOptions?: {       // Additional Algolia search options
    hitsPerPage?: number;
    // ... other Algolia options
  };
}
```

## Document Frontmatter

The plugin supports frontmatter in your markdown files:

```markdown
---
title: Custom Page Title
description: Page description for search
tags: [guide, tutorial]
---

# Page Content

Your markdown content here...
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: Open search
- `↑/↓`: Navigate results
- `Enter`: Go to selected result
- `Escape`: Close search

## Styling

The plugin includes default CSS that integrates with Athen's theme system. You can customize the appearance by overriding CSS variables:

```css
:root {
  --search-bg: var(--vp-c-bg-alt);
  --search-border: var(--vp-c-border);
  --search-text: var(--vp-c-text-1);
}
```

## API Reference

### SearchBox Component

```tsx
interface SearchBoxProps {
  provider?: 'flex' | 'algolia';
  placeholder?: string;
  algolia?: AlgoliaConfig;
  langRoutePrefix?: string;
}
```

### SearchIndexBuilder

```typescript
class SearchIndexBuilder {
  constructor(options?: SearchOptions);
  addDocument(filePath: string, content: string): void;
  addDocumentsFromDirectory(dir: string, baseDir?: string): void;
  search(query: string): Promise<SearchResult[]>;
  generateSearchIndex(): string;
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Type checking
npm run typecheck
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
