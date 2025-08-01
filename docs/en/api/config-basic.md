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

The title of site. This will be used as the title of the home page and the title of the HTML document. For example:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  title: 'my-site'
});
```

## description

- Type: `string`
- Default: `""`

The description of site. This will be used as the description of the home page and the description of the HTML document. For example:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  description: 'This is my site.'
});
```

## icon

- Type: `string`
- Default: `""`

The icon of the site. This will be used as the icon of the home page and the icon of the HTML document. For example:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  icon: '/icon.png'
});
```

Then Athen will find your icon in the `public` directory.

## colorScheme

- Type: `boolean`
- Default: `true`

Whether to appear the dark mode/light mode toggle button. For example:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  colorScheme: false
});
```

## search

- Type: `boolean`
- Default: `true`

Whether to enable search.You can disable it by setting it to `false`:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    search: false
  }
});
```

## outDir

- Type: `string`
- Default: `.athen/dist`

The output directory for the built site. For example:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  outDir: 'dist'
});
```
