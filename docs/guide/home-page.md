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

Simply set **`layout: home`** in Front Matter and Athen will render the built-in Home layout.
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
layout: home

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
      link: /guide/getting-started
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
  link: /guide/getting-started
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

## Fully Custom Home

Use a fully custom home when frontmatter blocks are not enough and you want complete control over markup, data, and styles. The recommended pattern is:

- `index.mdx` owns the route and renders your component.
- `components/CustomHome.tsx` owns the layout.
- `components/home.data.ts` owns editable content.
- `components/home.css` owns the visual system.

```mdx title="index.mdx"
import { CustomHome } from './components/CustomHome';
import { homeData } from './components/home.data';

<CustomHome data={homeData} />
```

```tsx title="components/CustomHome.tsx"
import './home.css';

interface HomeAction {
  text: string;
  href: string;
}

interface CustomHomeData {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryAction: HomeAction;
  secondaryAction: HomeAction;
  image: { src: string; alt: string };
  metrics: Array<{ value: string; label: string }>;
  features: Array<{ title: string; text: string }>;
  workflow: string[];
  sponsors: string[];
  faq: Array<{ question: string; answer: string }>;
}

export function CustomHome({ data }: { data: CustomHomeData }) {
  return (
    <main class="custom-home">
      <section class="custom-home-hero">
        <div>
          <p class="custom-home-eyebrow">{data.eyebrow}</p>
          <h1>{data.title}</h1>
          <p class="custom-home-subtitle">{data.subtitle}</p>
          <div class="custom-home-actions">
            <a class="custom-home-button primary" href={data.primaryAction.href}>
              {data.primaryAction.text}
            </a>
            <a class="custom-home-button secondary" href={data.secondaryAction.href}>
              {data.secondaryAction.text}
            </a>
          </div>
        </div>
        <img class="custom-home-image" src={data.image.src} alt={data.image.alt} />
      </section>

      <section class="custom-home-grid">
        {data.features.map((feature) => (
          <article class="custom-home-card" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

```ts title="components/home.data.ts"
export const homeData = {
  eyebrow: 'Fully custom home',
  title: 'Build a custom docs home',
  subtitle: 'Change content in one data file and style it with scoped CSS.',
  primaryAction: { text: 'Start Building', href: '/guide/getting-started' },
  secondaryAction: { text: 'View Source', href: 'https://github.com/estjs/athen' },
  image: { src: '/home-hero.svg', alt: 'Custom home preview' },
  metrics: [{ value: '1', label: 'MDX route' }],
  features: [
    {
      title: 'Editable content',
      text: 'Copy, links, metrics, features, workflow, sponsors, and FAQ live in data.'
    }
  ],
  workflow: ['Create index.mdx', 'Render a component', 'Edit data and CSS'],
  sponsors: ['Athen', 'Vite', 'Essor'],
  faq: [{ question: 'Can I replace the built-in home?', answer: 'Yes.' }]
};
```

```css title="components/home.css"
.custom-home {
  --home-brand: #2e6f63;
  width: min(1120px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 56px 0 72px;
}

.custom-home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
  gap: 40px;
  align-items: center;
}

.custom-home h1 {
  margin: 0;
  font-size: 58px;
  line-height: 1;
}

.custom-home-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 820px) {
  .custom-home-hero,
  .custom-home-grid {
    grid-template-columns: 1fr;
  }
}
```

See `examples/docs-site` for the complete version with hero, actions, metrics, feature cards, workflow, sponsors, FAQ, responsive CSS, and public assets.
