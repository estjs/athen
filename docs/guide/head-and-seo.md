# Head & SEO

Athen drives `<title>`, `<html lang>`, and `<meta name="description">` through [Unhead](https://unhead.unjs.io). The same code path serves the initial SSG render and every SPA navigation that follows — there is no separate "client-side head sync" you need to wire up.

## How `<title>` is composed

`{page title} | {site title}` is the only template Athen ships. The fallback chain for the page-title slot, in order:

1. `frontmatter.title` of the current page
2. The matched route's resolved title (heading from MDX or filename humanization)
3. `siteData.title` (used alone when no page title exists)

If page and site titles are identical, the `|` join collapses so you never see `"Athen | Athen"`.

## Per-page

Set per-page meta in front matter:

```md
---
title: Quick Start
description: Get up and running with Athen in five minutes.
---

# Quick Start

…
```

`frontmatter.title` wins over the MDX `<h1>` and over `siteData.title`. `frontmatter.description` wins over the locale or site description for the `<meta name="description">` tag.

## Per-locale

Per-locale `<head>` entries, descriptions, and `<html lang>` go in `locales`:

```ts
export default defineConfig({
  lang: 'en',
  title: 'Athen',
  description: 'Vite + Essor documentation framework',

  locales: {
    '/': {
      label: 'English',
      lang: 'en',
      outlineTitle: 'On this page',
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh',
      description: 'Vite 与 Essor 驱动的文档框架',
      outlineTitle: '本页内容',
      head: [
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ],
    },
  },
});
```

Any route under `/zh/` will emit `<html lang="zh">` automatically and pick up the locale's description, head tags, and aside outline label.

## Site-wide

`siteData.head` adds tags to every page. Each entry is a `[tag, attrs?, children?]` tuple:

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#3b8eea' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify({ '@context': 'https://schema.org' })],
  ],
});
```

Locale-level `head` arrays append on top of these.

## SPA navigation

When the user clicks an internal link, Athen does not re-fetch the document. The reactive `pageData` updates, an `effect` running inside `runtime/head.ts` patches the Unhead entry, and Unhead applies the diff to `document.head`. As a result:

- `document.title` updates instantly
- `<html lang>` flips when crossing locales (e.g. `/guide/x` → `/zh/guide/x`)
- `<meta name="description">` is replaced in place

No browser reload. No FOUC of stale meta. If you observe a full reload during link navigation it means the link's `href` left the SPA boundary (a different domain or an external URL).

## What Athen does NOT expose (yet)

- A `useHead()` composable for theme authors. Internal use only for now; if you need it, file an issue.
- A `titleTemplate` config. Title formatting is fixed at `{page} | {site}` (with the safe collapse rules above).
