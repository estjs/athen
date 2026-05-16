# Analytics Guide

This config demonstrates Google Analytics, Plausible, Umami, and a custom snippet.

```ts
analytics: {
  google: { id: 'G-ATHENEXAMPLE' },
  plausible: { domain: 'docs.example.com' },
  umami: {
    id: 'umami-example-id',
    src: 'https://analytics.example.com/script.js',
  },
  custom: {
    snippet: 'window.__CUSTOM_ANALYTICS_EXAMPLE__ = "custom analytics example";',
  },
}
```

## Disable Analytics

Use `analytics: false` when you want to remove the optional analytics plugin entirely.

The copyable disabled preset lives at `examples/integrations/analytics-disabled/athen.config.ts`.

```ts
export default defineConfig({
  title: 'Analytics Disabled Preset',
  analytics: false,
});
```

## What This Covers

- Multiple providers can be enabled at the same time.
- Provider-specific fields stay under their provider key.
- `custom.snippet` can inject a small inline script when a provider is not built in.
- `analytics: false` disables built-in analytics injection.
