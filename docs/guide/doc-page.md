# Doc Page

The Athen default theme has an built-in doc page.You can configure the its components by the following ways:

## Sidebar

Refer to the left sidebar.You can configure the sidebar in the front matter of the body page:

```md
---
sidebar: false
---
```

The value of `sidebar` is a boolean value, if `false`, the sidebar will not be shown.

### Auto Sidebar

Set `themeConfig.sidebar` to `'auto'` when you want Athen to generate sidebar groups from your document routes:

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    sidebar: 'auto'
  }
});
```

The generated item text comes from frontmatter `title`, then the first heading, then the route path. Pages are grouped by the first route segment, so `guide/install.md` becomes a sidebar item under `/guide/`.

Use frontmatter `order` to sort items inside a generated group:

```md title="guide/install.md"
---
title: Install
order: 2
---

# Install
```

Lower numbers appear first. Pages without `order` are placed after ordered pages and sorted by route path. `sidebarOrder` is also supported for compatibility.

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

For multilingual sites, put `sidebar: 'auto'` in each locale config. Athen will generate sidebars inside that locale prefix and keep language sections separate:

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

To hide a page from an auto sidebar while still keeping the route available, set:

```md
---
sidebar: false
---

# Internal Draft
```

## Outline

### Disable Outline

Outline information will be presented in the right sidebar, you can configure the outline information in the front matter of the body page:

```md
---
outline: false
---
```

The value of `outline` is a boolean value, if `false`, outline information won't be displayed.

### Outline Title Config

You can configure the title of the outline by `themeConfig.outlineTitle`:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    outlineTitle: 'ON THIS PAGE'
  }
});
```

## Prev/Next Page

You can configure the previous page text by `themeConfig.prevPageText` or `themeConfig.nextPageText`:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    prevPageText: 'Previous Page',
    nextPageText: 'Next Page'
  }
});
```

## Edit Link

You can configure the edit link by `themeConfig.editLink`:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/estjs/athen/tree/master/docs/:path'
    }
  }
});
```

## Last Updated Text

You can configure the last updated text by `themeConfig.lastUpdatedText`:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    lastUpdatedText: 'Last Updated'
  }
});
```
