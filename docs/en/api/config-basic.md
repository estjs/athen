# Basic Config

## base

- Type: `string`
- Default: `/`

The base URL the site will be deployed at. You can set this to a subdirectory if you plan to deploy your site to a subdirectory of your domain.

For example, if you plan to deploy your site to `https://foo.github.io/bar/`, then you should set `base` to `"/bar/"`:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  base: '/bar/'
});
```

## title

- Type: `string`
- Default: `"athen"`

The title of site. This will be used as the title of the home page and the title of the HTML document.

```js
import { defineConfig } from 'athen';

export default defineConfig({
  title: 'my-site'
});
```

## description

- Type: `string`
- Default: `""`

The description of site. This will be used as the description of the home page and the description of the HTML document.

## icon

- Type: `string`
- Default: `""`

The icon of the site. This will be used as the icon of the home page and the icon of the HTML document. Athen will find your icon in the `public` directory.

## srcDir

- Type: `string`
- Default: `undefined`

The directory where your markdown pages are located. If undefined, it will use the project root or the directory you pass to the CLI.

## outDir

- Type: `string`
- Default: `.athen/dist`

The output directory for the built site.

## tempDir

- Type: `string`
- Default: `undefined`

The temporary directory for intermediate build files.

## lang

- Type: `string`
- Default: `"en-US"`

The default language of the site.

## langs

- Type: `string[]`
- Default: `undefined`

The array of supported languages for the site.

## head

- Type: `HeadConfig[]`
- Default: `[]`

Custom tags to be injected into the HTML `<head>`.

```js
import { defineConfig } from 'athen';

export default defineConfig({
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  ]
});
```

## colorScheme

- Type: `boolean`
- Default: `true`

Whether to appear the dark mode/light mode toggle button.

## enableSpa

- Type: `boolean`
- Default: `undefined`

Enable Single Page Application routing in production mode.

## allowDeadLinks

- Type: `boolean`
- Default: `false`

Whether to fail builds when there are dead links. If set to `true`, the build will not fail.

## themeConfig

- Type: `ThemeConfig`
- Default: `{}`

The theme configuration. For the default theme configuration, see [Theme Config](./config-theme).

## vite

- Type: `ViteConfiguration`
- Default: `{}`

Pass custom configuration to Vite. This config will be merged with the internal Vite configuration.

## route

- Type: `RouteOptions`
- Default: `{}`

Custom configuration for route scanning. You can use `include` and `exclude` to control which Markdown files generate page routes.

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  route: {
    // Ignore all files under the secret directory and specific files
    exclude: ['**/secret/**', 'drafts.md'],
    // Only include specific file types (optional)
    include: ['**/*.{md,mdx}']
  }
});
```

## plugins

- Type: `PluginOption[]`
- Default: `[]`

Custom Vite or Athen plugins. If a plugin shares the same `name` with a built-in one, it will override it.

## theme

- Type: `string`
- Default: `undefined`

Custom theme package name or relative/absolute path. If not provided, built-in default theme will be used.

## instances

- Type: `Array<{ root: string; base?: string; outDir?: string; }>`
- Default: `[]`

Multiple site instances in a single repository.

## search

- Type: `SearchConfig | boolean`
- Default: `true`

Whether to enable search. You can configure the search provider or disable it entirely:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  search: {
    provider: 'flex',
    searchOptions: { limit: 10, suggest: true }
  }
});
```

## analytics

- Type: `Record<string, any> | false`
- Default: `false`

Configure analytics integrations. Passing `false` disables built-in analytics.

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  analytics: {
    google: { id: 'G-XXXX' },
    baidu: { id: 'xxxx' },
    umami: { id: 'uuid', src: 'https://umami.example.com/script.js' }
  }
});
```
