# 主页

Athen 默认主题内置了主页，你可以通过书写 markdown 的 Front Matter 来配置它。举个简单的例子：

```md
---
layout: home

hero:
  name: Athen
  text: Vite & Essor 文档框架
---
```

只需在 Front Matter 中设置 **`layout: home`**（或兼容的 `pageType: home`）即可启用内置主页布局。
主页目前包含 **四** 个可配置区块：`hero`、`features`、`cta`、`sponsors`。

## 开屏

开屏部分是主页的 Logo、简介及跳转按钮部分，它的配置是一个对象，有以下类型：

```ts
export interface Hero {
  // Logo 名字
  name?: string;
  // Logo 简介文本
  text?: string;
  // 标语文本 (显示在 Logo 下方可选)
  tagline?: string;
  // Logo 图片
  image?: HeroImage;
  // 跳转按钮
  actions?: HeroAction[];
}

export interface HeroImage {
  // 图片地址
  src: string;
  // 图片 alt 文本
  alt?: string;
}

export interface HeroAction {
  // 按钮，可选为主题(brand)色或者灰色
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
}
```

举个例子:

```md
---
pageType: home

hero:
  name: athen
  text: Vite & Essor 文档框架
  tagline: 简单、强大且高性能
  image:
    src: /athen.png
    alt: athen
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub 地址
      link: https://github.com/estjs/athen
---
```

## 特性

特性部分是主页的特性介绍部分，它的配置是一个数组，每个元素有以下类型：

```ts
export interface Feature {
  // Feature 标题
  title: string;
  // Feature 详细介绍
  details: string;
  // Feature 图标，一般为 emoji
  icon: FeatureIcon;
}

export type FeatureIcon =
    | string
    | { src: string; alt?: string; width?: string; height: string };
```

举个例子:

```md
features:

- title: "Vite: 无与伦比的开发体验"
  details: 以 Markdown 内容为中心，旨在帮助您专注于编写并以最少的配置进行部署。
  icon: 🚀
- title: 'MDX: 灵活的内容编写方式'
  details: MDX 是一种强大的内容编写方式。您可以在 Markdown 中使用 Essor 组件。
  icon: 📦
- title: 'athens Arch: 生产环境中更高的性能'
  details: 专为 athens 架构设计，这意味着更少的 Javascript 打包、部分水合（partial hydration）以及更好的性能。
  icon:
    src: /athens-arch-feature-icon.svg
```

## CTA（行动号召）

CTA 区块用于引导访客进行下一步操作，例如「开始使用」。

```ts
export interface CTA {
  title: string;
  text?: string;
  link?: string;      // 跳转地址
  buttonText?: string; // 按钮文案（默认：Get Started）
}
```

示例：

```md
cta:
  title: "准备好开始了吗？"
  text: "5 分钟上手体验。"
  link: /zh/guide/getting-started
  buttonText: "快速上手"
```

## 赞助商（sponsors）

展示赞助商或合作伙伴徽标。

```ts
export interface Sponsor {
  name: string;
  logo: string; // 图片地址
  link: string; // 外部链接
}
```

示例：

```md
sponsors:
  - name: Vite
    logo: /logos/vite.svg
    link: https://vitejs.dev
  - name: Essor
    logo: /logos/essor.svg
    link: https://essorjs.org
```

## 页脚

你可以通过 `themeConfig.footer` 来自定义主页的页脚。它的配置是一个对象，有以下类型：

```ts
export interface Footer {
  // 版权信息(显示在最底部)
  copyright?: string;
  // 页脚文本
  message?: string;
}
```

举个例子:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    footer: {
      message: '基于 MIT 协议开源。',
      copyright: 'Copyright © 2023-present estjs'
    }
  }
});
```
