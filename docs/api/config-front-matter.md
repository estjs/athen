# Front Matter Config

## title

- Type: `string`

The title of the page. By default, the h1 title of the page will be used as the title of the HTML document. But if you want to use a different title, you can use the `title` front matter to specify the title of the page. For example:

```md
---
title: My Page
---
```

## description

- Type: `string`

The custom description of the page. For example:

```md
---
description: This is my page.
---
```

## pageType

- Type: `'home' | 'doc' | 'api' | 'custom' | '404'`
- Default: `'doc'`

The type of the page. By default, the page type is `'doc'`. But if you want to use a different page type, you can use the `pageType` front matter to specify the page type.

## layout

- Type: `string`
- Default: `undefined`

The layout to use when rendering the page.

## api

- Type: `boolean`
- Default: `false`

Enable api page. It's equal to `pageType: 'api'`:

```md
---
api: true
---
```

## hero

- Type: `Object`

The hero config of `home` page. It has following type:

```ts
export interface Hero {
  name: string;
  text: string;
  tagline: string;
  image?: {
    src: string;
    alt: string;
  };
  actions: {
    text: string;
    link: string;
    theme: 'brand' | 'alt';
  }[];
}
```

## features

- Type: `Array`
- Default: `[]`

The features config of `home` page. It has following type:

```ts
export interface Feature {
  title: string;
  details: string;
  icon: string;
}
```

## sidebar

- Type: `boolean`
- Default: `true`

Whether to display the left sidebar on the page. Set to `false` to hide it.

## outline

- Type: `boolean`
- Default: `true`

Whether to display the right outline on the page. Set to `false` to hide it.

## lineNumbers

- Type: `boolean`
- Default: `false`

Whether to show line numbers for code blocks on this page.

## sponsors

- Type: `Sponsor[]`
- Default: `[]`

Sponsor list for the page.

```ts
export interface Sponsor {
  name: string;
  logo: string;
  link: string;
}
```

## cta

- Type: `Object`

The Call To Action config.

```ts
export interface CTA {
  title: string;
  text?: string;
  link?: string;
  buttonText?: string;
}
```
