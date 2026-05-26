# Front Matter 配置

## title

- Type: `string`

页面的标题。默认情况下，页面的 h1 标题将用作 HTML 文档的标题。但是如果你想使用不同的标题，你可以使用 Front Matter 来指定页面的标题。例如：

```md
---
title: 我的主页
---
```

## description

- Type: `string`

页面的自定义描述。例如：

```md
---
description: 这是我的主页
---
```

## pageType

- Type: `'home' | 'doc' | 'api' | 'custom' | '404'`
- Default: `'doc'`

页面的类型。默认情况下，页面类型为`doc`。但是如果你想使用不同的页面类型，你可以使用`pageType`指定页面类型。

## layout

- Type: `string`
- Default: `undefined`

渲染页面时使用的布局。

## api

- Type: `boolean`
- Default: `false`

设为 `true` 时，Athen 会自动解析子页面的 `<h1>`/`<h2>` 标题，按 `sidebar` 配置分组渲染成 API 概览页。等效于 `layout: api`：

```md
---
api: true
---
```

## hero

- Type: `Object`

`home` 页面的 hero 配置。它有以下类型：

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

`home` 页面的功能配置。它有以下类型：

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

是否在页面上显示左侧边栏。设置为 `false` 可以隐藏它。

## outline

- Type: `boolean`
- Default: `true`

是否在页面上显示右侧大纲。设置为 `false` 可以隐藏它。

## lineNumbers

- Type: `boolean`
- Default: `false`

是否在当前页面的代码块中显示行号。

## sponsors

- Type: `Sponsor[]`
- Default: `[]`

页面的赞助商列表。

```ts
export interface Sponsor {
  name: string;
  logo: string;
  link: string;
}
```

## cta

- Type: `Object`

号召性用语配置。

```ts
export interface CTA {
  title: string;
  text?: string;
  link?: string;
  buttonText?: string;
}
```
