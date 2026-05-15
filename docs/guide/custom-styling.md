# Custom Styling & UnoCSS

The Athen default theme uses CSS variables to control visual elements and features [UnoCSS](https://unocss.dev/) out of the box as an atomic CSS engine. You can customize the look of your documentation by overriding CSS variables or configuring UnoCSS.

## Overriding CSS Variables

All colors, fonts, shadows, and breakpoints in the default theme can be overridden via CSS variables prefixed with `--at-c-`.

### Common Variables

Some of the most useful variables (refer to `theme-default/styles/vars.css` in the source for the full list):

- **Brand Colors**: `--at-c-brand` / `--at-c-brand-light` / `--at-c-brand-dark`
- **Backgrounds**: `--at-c-bg` / `--at-c-bg-soft` / `--at-c-bg-mute`
- **Text**: `--at-c-text-1` (primary) / `--at-c-text-2` (secondary)
- **Code Block BG**: `--at-code-block-bg`

### How to Override

Assuming you want to switch the brand color to purple, create a CSS file:

```css
/* my-custom-vars.css */
:root {
  /* Override Brand Color */
  --at-c-brand: #646cff;
  --at-c-brand-light: #747bff;
  --at-c-brand-dark: #535bf2;
}

/* Dark mode overrides */
.dark {
  --at-c-brand: #9499ff;
}
```

Currently, the most robust way to load this file is by wrapping the default theme in a **custom theme package** and importing the CSS file inside it.

## Using UnoCSS

Athen integrates `unocss/vite` internally and enables `@unocss/preset-uno` and `@unocss/preset-icons` by default.

### Atomic CSS in Markdown

You can write UnoCSS utility classes directly in your `.mdx` or `.md` files:

```html
<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center shadow-md">
  This is a block styled with UnoCSS!
</div>
```

### Using `uno.config.ts`

If you need to add custom Uno rules or shortcuts, create a `uno.config.ts` file in your project root (where you run `athen dev`). The Vite plugin will automatically merge it with Athen's internal configuration.

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700'],
  ],
})
```
