# Home Page

Athen default theme has a built-in Home page, you can configure it by writing markdown Front Matter. Take a simple example:

```md
---
layout: home

hero:
  name: Athen
  text: Vite & Essor documentation framework
---
```

Simply set **`layout: home`** (or legacy `pageType: home`) in Front Matter and Athen will render the built-in Home layout.
The Home layout now offers **four** configurable blocks: `hero`, `features`, `cta`, and `sponsors`.

## hero

The `hero` part is the logo, introduction and jump button parts of the Home page, and its configuration is an object with the following types:

```ts
export interface Hero {
  // Logo name
  name?: string;
  // Logo introduction text
  text?: string;
  // Tagline text (optional to display below Logo)
  tagline?: string;
  // Logo image
  image?: HeroImage;
  // Jump button
  actions?: HeroAction[];
}

export interface HeroImage {
  // image address
  src: string;
  // alt text
  alt?: string;
}

export interface HeroAction {
  // Button, optional brand color or gray
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
}
```

For example:

```md
---
pageType: home

hero:
  name: athen
  text: Vite & Essor document framework
  tagline: Simple, powerful, and performant
  image:
    src: /athen.png
    alt: athen
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/estjs/athen
---
```

## features

The `features` section is the feature introduction section of the Home page, its configuration is an array, each element has the following types:

```ts
export interface Feature {
  // Feature title
  title: string;
  // Feature details
  details: string;
  // Feature icon, usually emoji
  icon: FeatureIcon;
}

export type FeatureIcon =
    | string
    | { src: string; alt?: string; width?: string; height: string };
```

For example:

```md
features:

- title: "Vite: The DX that can't be beat"
  details: With Markdown-centered content, it's built to help you focus on writing and deployed with minimum configuration.
  icon: 🚀
- title: 'MDX: The flexible way to write content'
  details: MDX is a powerful way to write content. You can use Essor components in Markdown.
  icon: 📦
- title: 'athens Arch: The higher performance in production'
  details: Designed to be athens architecture, means less javascript bundle, partial hydration and better performance about FCP, TTI.
  icon:
    src: /athens-arch-feature-icon.svg
```

## cta (Call to Action)

The CTA block helps you drive visitors to an important next step.

```ts
export interface CTA {
  title: string;
  text?: string;
  link?: string;      // Destination page
  buttonText?: string; // Button label (default: "Get Started")
}
```

Example:

```md
cta:
  title: "Ready to explore?"
  text: "Kick-start your journey in 5 minutes."
  link: /en/guide/getting-started
  buttonText: "Get Started"
```

## sponsors

Display a set of sponsors or partners.

```ts
export interface Sponsor {
  name: string;
  logo: string; // Image url
  link: string; // External link
}
```

Example:

```md
sponsors:
  - name: Vite
    logo: /logos/vite.svg
    link: https://vitejs.dev
  - name: Essor
    logo: /logos/essor.svg
    link: https://essorjs.org
```

## Footer

You can customize the footer of the Home page via `themeConfig.footer`. Its configuration is an object with the following types:

```ts
export interface Footer {
  // Copyright information (displayed at the very bottom)
  copyright?: string;
  // Footer text
  message?: string;
}
```

For example:

```js
import { defineConfig } from 'athen';

export default defineConfig({
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present estjs'
    }
  }
});
```
