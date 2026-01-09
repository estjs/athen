# Athen Plugin System

Athen leverages Vite’s powerful plugin architecture and layers a few conveniences on top to cover documentation-specific scenarios.

This document explains:

1. What ships *out of the box* (built-in plugins)
2. How to add **custom plugins**
3. How to **override** or **disable** a built-in plugin
4. Authoring best practices

---

## 1. Built-in plugins

The core package registers several plugins automatically when you start or build the docs site.

| Name                      | Description                               |
| ------------------------- | ----------------------------------------- |
| `athen:config`            | Exposes site data as virtual module, alias `@theme` etc. |
| `athen:routes`            | Generates page routes from the file system |
| `athen:transform`         | MDX → JSX transforms, front-matter injection |
| `plugin-mdx`              | MDX compilation with Shiki, GFM, TOC, Tip, etc. |
| `unocss`                  | Utility-first atomic CSS engine |
| `plugin-svgr`             | Import SVG files as Essor components |
| `inspect`                 | [`vite-plugin-inspect`](https://github.com/antfu/vite-plugin-inspect) – development helper |
| `plugin-search` (optional) | Client-side full-text search (FlexSearch) |
| `plugin-analytics` (optional) | Inject analytics snippet of your choice |

> The **optional** plugins are included only when they are enabled in `athen.config.ts`. See “override” section below.

---

## 2. Adding custom plugins

```ts title="athen.config.ts"
import { defineConfig } from 'athen';
import legacy from '@vitejs/plugin-legacy';
import someAthenPlugin from 'athen-plugin-awesome';

export default defineConfig({
  plugins: [
    legacy({ targets: ['defaults', 'not IE 11'] }),
    someAthenPlugin(),
  ],
});
```

Key points:

* `plugins` accepts any **Vite `PluginOption`** (plain objects, factory functions or plugin arrays).
* These plugins are placed **before** built-ins, so they can *override* behaviour if they share the same `name`.
* They run both in dev server & build unless you add your own conditional logic.

> You can still use plain `vite` field to pass an entire `vite` config, but `plugins` is the recommended, explicit approach.

---

## 3. Overriding & disabling built-ins

### Override

If a plugin in `plugins` has the **same `name`** as a built-in plugin, Athen silently drops the original built-in and keeps your version.

```ts
export default defineConfig({
  plugins: [
    // Replace internal FlexSearch plugin with Algolia variant
    {
      name: 'athen-plugin-search',
      enforce: 'pre',
      // …your implementation
    },
  ],
});
```

### Disable

You have two options:

1. Built-ins with explicit switch – e.g. search & analytics
   ```ts
   export default defineConfig({
     themeConfig: {
       search: false, // disable search completely
     },
     analytics: false, // disable analytics plugin injection
   });
   ```

2. Generic way – push a **`false`** placeholder under the same name
   ```ts
   export default defineConfig({
     plugins: [
       { name: 'athen-plugin-search', apply() { /* noop */ } },
     ],
   });
   ```
   Your noop plugin shadows the original one.

---

## 4. Authoring an Athen-specific plugin

An Athen plugin is just a normal Vite plugin, but you usually want access to **`root`** and **`base`** from the site config:

```ts
import type { SiteConfig } from 'athen';
import type { Plugin } from 'vite';

export default function myPlugin(cfg?: { /* ... */ }): Plugin {
  let site: SiteConfig;

  return {
    name: 'athen-plugin-my',

    configResolved(resolved) {
      site = (resolved as any).athenSite as SiteConfig;
    },

    transform(code, id) {
      // do something with docs under site.root
    },
  };
}
```

Publish your plugin under `athen-plugin-*` to help users discover it.

---

## 5. FAQ

**Q: In what order will plugins run?**
Athen returns `[...userPlugins, ...builtInPlugins]`. You can still rely on Vite’s `enforce: 'pre' | 'post'` within those arrays.

**Q: Can I use Rollup-only plugins?**
Yes—Vite will forward them to Rollup during build; they are ignored in dev server.

**Q: How do I share utilities between plugins?**
Export a helper library and consume it—you are in standard ESM land.
