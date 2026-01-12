# Search

Athen provides powerful built-in search functionality to help users quickly find the content they need.

## Overview

The search feature includes:

- **Full-text search** across all your documentation
- **Multi-language support** with CJK (Chinese, Japanese, Korean) optimization
- **Instant results** with fuzzy matching
- **Keyboard shortcuts** for quick access
- **Customizable** search options and UI

## Configuration

### Basic Setup

Enable search in your `athen.config.ts`:

```typescript
import { defineConfig } from 'athen';

export default defineConfig({
  // Enable local search (recommended)
  search: {
    provider: 'flex'
  },
  
  // Or use Algolia for cloud search
  // search: {
  //   provider: 'algolia',
  //   algolia: {
  //     appId: 'YOUR_APP_ID',
  //     apiKey: 'YOUR_SEARCH_API_KEY',
  //     indexName: 'YOUR_INDEX_NAME'
  //   }
  // }
});
```

### Advanced Configuration

For more control over search behavior:

```typescript
export default defineConfig({
  search: {
    provider: 'flex',
    
    // Files to include in search index
    include: ['**/*.md', '**/*.mdx'],
    
    // Files to exclude from search index
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Search options
    searchOptions: {
      limit: 10,        // Maximum results to show
      enrich: true,     // Include document metadata
      suggest: true,    // Enable search suggestions
    },
    
    // Custom result transformation
    transformResult: (results) => {
      return results.map(result => ({
        ...result,
        // Custom result processing
      }));
    }
  }
});
```

## Search Providers

### FlexSearch (Local)

FlexSearch provides client-side search with excellent performance:

**Pros:**
- No external dependencies
- Works offline
- Fast and lightweight
- Great for small to medium sites
- Multi-language support

**Cons:**
- Index size grows with content
- Limited to client-side processing

### Algolia (Cloud)

Algolia provides powerful cloud-based search:

**Pros:**
- Extremely fast search
- Advanced analytics
- Typo tolerance
- Faceted search
- Scales to any size

**Cons:**
- Requires external service
- Usage-based pricing
- Needs internet connection

## Usage

### Keyboard Shortcuts

- **Cmd/Ctrl + K**: Open search modal
- **↑/↓**: Navigate results
- **Enter**: Go to selected result
- **Escape**: Close search

### Search Syntax

The search supports various query types:

```
# Basic search
getting started

# Phrase search
"exact phrase"

# Multiple terms
configuration setup

# Exclude terms
javascript -node
```

## Customization

### Theme Integration

The search component integrates seamlessly with your theme:

```typescript
// In your theme config
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search documentation'
          },
          modal: {
            noResultsText: 'No results for',
            resetButtonTitle: 'Reset search',
            footer: {
              selectText: 'to select',
              navigateText: 'to navigate',
              closeText: 'to close'
            }
          }
        }
      }
    }
  }
});
```

### Custom Search Component

For advanced customization, you can create a custom search component:

```tsx
import { SearchBox } from '@athen/plugin-search/client';

export function CustomSearch() {
  return (
    <SearchBox
      provider="flex"
      placeholder="Search documentation..."
      className="custom-search"
    />
  );
}
```

## Multi-language Search

Athen's search automatically handles multiple languages:

```typescript
export default defineConfig({
  search: {
    provider: 'flex',
    // Automatically detects and indexes content in different languages
    // Optimized for CJK (Chinese, Japanese, Korean) languages
  },
  
  themeConfig: {
    locales: {
      '/': { lang: 'en-US' },
      '/zh/': { lang: 'zh-CN' },
      '/ja/': { lang: 'ja-JP' }
    }
  }
});
```

## Performance Tips

1. **Optimize content**: Keep pages focused and well-structured
2. **Use excludes**: Exclude unnecessary files from indexing
3. **Limit results**: Set appropriate result limits
4. **Consider Algolia**: For large sites, consider cloud search

## Troubleshooting

### Search not working?

1. Check that search is enabled in config
2. Verify file patterns in `include`/`exclude`
3. Check browser console for errors
4. Ensure content is properly indexed

### Poor search results?

1. Improve content structure with clear headings
2. Add relevant keywords to content
3. Use descriptive titles and descriptions
4. Consider custom result transformation

### Performance issues?

1. Reduce the number of indexed files
2. Optimize content size
3. Consider using Algolia for large sites
4. Implement result pagination

## Examples

Check out these search implementations:

- [Basic search setup](/examples/basic)
- [Multi-language search](/examples/i18n)
- [Custom search UI](/examples/custom-search)

## API Reference

For detailed API documentation, see:

- [Search Configuration](/api/search-config)
- [Search Components](/api/search-components)
- [Plugin API](/api/plugin-api)
