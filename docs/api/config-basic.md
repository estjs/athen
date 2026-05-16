# Basic Config

Athen config is intentionally shallow. Most commonly used options live at the top level, and only naturally grouped features use an object such as `themeConfig`, `markdown`, `search`, `vite`, or `route`.

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  title: 'My Docs',
  description: 'Product documentation',
  lang: 'en-US',
  base: '/',
  favicon: '/logo.svg',
  cleanUrls: true,
  trailingSlash: false,
  rewrites: {
    '/old-guide': '/guide/getting-started',
  },
  onBrokenLinks: 'throw',

  themeConfig: {
    nav: [{ text: 'Guide', link: '/guide/getting-started' }],
    sidebar: 'auto',
    links: [{ icon: 'github', link: 'https://github.com/estjs/athen' }],
  },

  defaultLocale: 'en',
  locales: {
    '/': {
      label: 'English',
      lang: 'en-US',
      sidebar: 'auto',
    },
    '/zh/': {
      label: '简体中文',
      lang: 'zh-CN',
      nav: [{ text: '指南', link: '/zh/guide/getting-started' }],
      sidebar: 'auto',
    },
  },

  markdown: {
    shiki: { theme: 'dark-plus' },
  },
});
```

## Top-Level Options

| Option | Type | Description |
| --- | --- | --- |
| `title` | `string` | Site title. |
| `description` | `string` | Site description and default HTML meta description. |
| `lang` | `string` | Default language tag. |
| `base` | `string` | Base URL for deployment. |
| `favicon` | `string` | Favicon path. `icon` remains as a compatibility alias. |
| `head` | `HeadConfig[]` | Extra tags injected into HTML `<head>`. |
| `colorScheme` | `boolean` | Enable dark/light color scheme support. |
| `srcDir` | `string` | Directory scanned for pages. |
| `outDir` | `string` | Build output directory. |
| `tempDir` | `string` | Temporary build directory. |
| `enableSpa` | `boolean` | Enable production SPA routing. |
| `onBrokenLinks` | `'throw' \| 'warn' \| 'ignore'` | Broken-link handling strategy. |
| `cleanUrls` | `boolean` | Normalize public page URLs without exposing file extensions. |
| `trailingSlash` | `boolean` | Control whether generated page URLs end with `/`. |
| `rewrites` | `Record<string, string>` | Treat old public paths as aliases for new paths during link checking. |
| `routeBasePath` | `string` | Prefix generated routes. |
| `include` / `exclude` | `string[]` | Include or exclude route files. |
| `extensions` | `string[]` | Route file extensions. |
| `theme` | `string` | Custom theme package or path. |
| `editUrl` | `string` | Edit-link URL pattern using `:path`. |
| `defaultLocale` | `string` | Default locale key or language tag. |
| `locales` | `Record<string, LocaleConfig>` | Locale-specific nav/sidebar/text overrides. |

## Grouped Options

- `themeConfig`: default theme navigation, sidebar, links, footer, outline, slots, and page labels.
- `markdown`: MDX/Markdown pipeline options such as Shiki theme, line numbers, `remarkPlugins`, and `rehypePlugins`.
- `search`: local FlexSearch or Algolia search configuration.
- `analytics`: analytics integrations.
- `vite`: Vite config merged with Athen's internal config.
- `plugins`: custom Vite/Athen plugins.
- `route`: advanced route scanner options. Prefer top-level `include`, `exclude`, `extensions`, and `routeBasePath` for common cases.

## route

Use `route` only when you need advanced scanner options. For most sites, prefer the shallow top-level aliases: `srcDir`, `routeBasePath`, `include`, `exclude`, and `extensions`.

## Migration Notes

The older VitePress-style `themeConfig` remains the recommended theme entry. The deeper experimental shape is still accepted for compatibility, but new projects should prefer the shallow form:

| Deeper form | Preferred shallow form |
| --- | --- |
| `site.title` | `title` |
| `site.description` | `description` |
| `site.base` | `base` |
| `site.favicon` | `favicon` |
| `docs.srcDir` | `srcDir` |
| `docs.onBrokenLinks` | `onBrokenLinks` |
| `docs.routeBasePath` | `routeBasePath` |
| `theme.config` | `themeConfig` |
| `theme.socialLinks` | `themeConfig.links` |
| `i18n.locales` | `locales` |

## Comparison Notes

Athen now supports the high-value configuration patterns from VitePress and Docusaurus while keeping config shallow:

- `themeConfig.sidebar: 'auto'` generates sidebar data from route metadata.
- `onBrokenLinks` checks local Markdown links and anchors during build.
- `cleanUrls`, `trailingSlash`, and `rewrites` keep public URLs stable.
- `defaultLocale` and `locales` provide locale-specific nav/sidebar/text overrides.
