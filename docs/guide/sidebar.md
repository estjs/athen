# Sidebar

Athen builds the left sidebar from your document routes. You control it three ways — per-page frontmatter, a per-folder `_meta.json`, and an explicit `themeConfig.sidebar` block.

> The page title comes from the page's first `# h1` heading (or a humanized file name when there is no heading); there is no `title` frontmatter field. Use `sidebar_label` to give the sidebar a different label.

## Page frontmatter

| Field | Type | Description |
| --- | --- | --- |
| `sidebar` | `boolean` | Set `false` to hide the page from the sidebar (the route stays available). |
| `sidebar_position` | `number` | Sort key within a group; lower appears first. |
| `sidebar_label` | `string` | Override the sidebar text (the page title is unchanged). |
| `sidebar_class_name` | `string` | Extra CSS class on the sidebar item. |
| `sidebar_key` | `string` | Stable unique key for the item (used as the render key). |

```md title="guide/install.md"
---
sidebar_position: 2
sidebar_label: Easy
sidebar_class_name: green
sidebar_key: guide-install
---

# Install
```

The generated item text comes from `sidebar_label`, then the page's first heading, then the route path. Pages without `sidebar_position` are placed after ordered pages and sorted by route path. Put any of these fields in a folder's `index.md` to control that whole section.

To hide a page from the sidebar while keeping its route available:

```md
---
sidebar: false
---

# Internal Draft
```

## Auto sidebar

Set `themeConfig.sidebar` to `'auto'` to generate sidebar groups from your routes. Pages are grouped by the first route segment, so `guide/install.md` becomes an item under `/guide/`:

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    sidebar: 'auto'
  }
});
```

You can mix generated and manual sidebars:

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    sidebar: {
      '/guide/': 'auto',
      '/api/': [
        {
          text: 'API',
          items: [{ text: 'Config', link: '/api/config' }]
        }
      ]
    }
  }
});
```

For multilingual sites, put `sidebar: 'auto'` in each locale config. Athen generates sidebars inside that locale prefix and keeps language sections separate:

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  defaultLocale: 'en',
  locales: {
    '/': {
      label: 'English',
      lang: 'en-US',
      sidebar: 'auto'
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh-CN',
      sidebar: 'auto'
    },
    '/fr/': {
      label: 'Français',
      lang: 'fr-FR',
      sidebar: 'auto'
    }
  }
});
```

## Per-folder `_meta.json`

When Athen scans a directory it looks for an optional `_meta.json` that customises the sidebar for that folder. No config block is required — drop the file next to your Markdown and the auto-sidebar picks it up.

```
docs/
  guide/
    getting-started.md
    install.md
    _meta.json          ← controls sidebar for /guide/
```

A minimal `_meta.json`:

```json
{
  "title": "Guide",
  "items": ["getting-started", "install"]
}
```

Sidebar output (auto-derived):

```
Guide
  Getting Started
  Install
```

### Schema

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Group label in the sidebar; defaults to the humanised folder name. |
| `order` | `number` | Sort key when sibling groups are ordered — lower appears first. |
| `items` | `string[]` | Ordered list of child file/stem basenames (without extension) or subfolder names. Items are pinned in the declared order; any child *not* listed is appended alphabetically at the end. |
| `collapsed` | `boolean` | Collapse this group by default (chevron closed). |
| `hidden` | `boolean` | Hide the folder and all its children from the sidebar (pages remain routable). |

### How `items` ordering works

1. All names listed in `items` come first, in declared order.
2. Names not listed still appear — sorted alphabetically — after the pinned set.
3. To **hide** a child, omit it from `items` and set `sidebar: false` in that child's frontmatter.
4. Dashes and underscores in file names are humanised: `getting-started` → "Getting Started"; `api_reference` → "Api Reference".

### Example with subfolders

```
docs/
  api/
    _meta.json
    config-basic.md
    config-theme.mdx
  guide/
    getting-started.md
    install.md
    _meta.json
  index.md
```

`docs/guide/_meta.json`:

```json
{
  "title": "Guide",
  "order": 1,
  "items": ["getting-started", "install"],
  "collapsed": false
}
```

`docs/api/_meta.json`:

```json
{
  "title": "API Reference",
  "order": 2,
  "items": ["config-basic", "config-theme"],
  "collapsed": false
}
```

Result:

```
Guide                           (order 1)
  Getting Started               (pinned)
  Install                       (pinned)
API Reference                   (order 2)
  Basic Config                  (pinned)
  Theme Config                  (pinned)
```

## Interaction between the three sources

- `_meta.json#items` pins the *presence and order* of sidebar entries.
- `frontmatter.sidebar_position` sets per-page sort weight **within** the pinned-or-alphabetical set. Lower appears first.
- `frontmatter.sidebar: false` removes a page even if it is listed in `items`.
- `frontmatter.sidebar_label` overrides the display name; `_meta.json#title` only provides a fallback label.

If both a folder `_meta.json` and an explicit `sidebar` block in `athen.config.ts` target the same route prefix, the explicit block wins.
