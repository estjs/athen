# Welcome to Athen Search

This is a test document for the Athen search functionality.

## Features

- **FlexSearch Integration**: Fast client-side search
- **Algolia Support**: Cloud-based search
- **Multi-language**: Support for different languages

## Getting Started

To get started with Athen search, simply configure it in your `athen.config.ts`:

```typescript
export default defineConfig({
  search: {
    provider: 'flex'
  }
});
```

## Advanced Usage

You can customize the search behavior with various options:

- Include/exclude patterns
- Custom field indexing
- Result transformation
