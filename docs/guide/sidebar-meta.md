# _meta.json

When Athen scans a directory for pages, it looks for an optional `_meta.json` file that customises the sidebar for that folder. No config block is required — drop the file next to your Markdown and the auto-sidebar will pick it up.

## Quick start

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

## Schema

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Group label in the sidebar; defaults to humanised folder name. |
| `order` | `number` | Sort key when sibling groups are ordered — lower appears first. |
| `items` | `string[]` | Ordered list of child file/stem basenames (without extension) or subfolder names. Items are pinned in the declared order; any child *not* listed is appended alphabetically at the end. |
| `collapsed` | `boolean` | Collapse this group by default (chevron closed). |
| `hidden` | `boolean` | Hide the folder and all its children from the sidebar (pages remain routable). |

### How `items` ordering works

1. All names listed in `items` come first, in declared order.
2. Names not listed still appear — sorted alphabetically — after the pinned set.
3. To **hide** a child, simply omit it from `items` and set `sidebar: false` in that child's frontmatter.
4. Dashes and underscores in file names are humanised: `getting-started` → "Getting Started"; `api_reference` → "Api Reference".

## Example with subfolders

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

## Per-file `_meta.json` (experimental)

A single Markdown file can also have a companion `_meta.json` when the file is placed in its own folder. In that case the JSON's `title` and `order` fields override what would normally come from frontmatter or the filename.

```
docs/
  guide/
    getting-started/
      index.md
      _meta.json      → { "title": "Start Here", "order": 0 }
```

The sidebar entry reads "Start Here", ordered before everything else in `/guide/`.

## Interaction with frontmatter

- `_meta.json#items` pins the *presence and order* of sidebar entries.
- `frontmatter.order` sets per-page sort weight **within** the pinned-or-alphabetical set. Lower appears first.
- `frontmatter.sidebar: false` removes a page even if it is listed in `items`.
- `frontmatter.title` overrides the display name; `_meta.json` only provides fallback labels.

If both a `_meta.json` in a folder and an explicit `sidebar` config block in `athen.config.ts` target the same route prefix, the explicit block wins.
