# Theme Package System

Athen supports extending or completely replacing the default look & feel through **theme packages**.
A theme package is just an npm package (or local folder) that exports a set of Essor components and optional assets which the documentation runtime will load at build / dev time.

## 1. Quick Start

### 1.1 Use a Local Theme Folder

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  theme: './my-theme', // relative to project root
});
```

Create the folder:

```text
my-theme/
  ├─ components/      # Essor components that override defaults
  ├─ styles/          # Your css / scss / uno files
  └─ index.ts         # Theme entry, exports Vite/Rollup compatible modules
```

During dev/build Athen will automatically alias `@theme` to that directory, so you can import resources with:

```tsx
import Button from '@theme/components/Button';
```

### 1.2 Use a Published Theme Package

```bash
pnpm add -D athen-theme-carbon # or npm / yarn
```

```ts title="athen.config.ts"
export default defineConfig({
  theme: 'athen-theme-carbon',
});
```

Athen resolves the package via Node resolution (`require.resolve`).  Make sure the package exports an `index.js` / `index.ts` at its root (or declare an explicit `exports` field) so that the directory can be located.

## 2. Authoring a Theme

A theme package **must** export at least one component called `Layout` which is the root of every page.

```tsx title="my-theme/Layout.tsx"
import type { Theme } from 'athen';

const Layout: Theme.Layout = ({ children, pageData, siteData }) => {
  return (
    <div className="my-theme-layout">
      {/* your header / sidebar */}
      {children}
    </div>
  );
};

export default Layout;
```

Besides `Layout` you may override any component inside the default theme just by exposing a file with the same name under `components/`. For example, to use your own `Nav`:

```
components/
  Nav/
    index.tsx
```

When that file exists, Athen will automatically prefer it over the built-in one.

### 2.1 Optional Hook `enhanceApp`

If your theme needs to register global side-effects (e.g. add a provider, register icons) you can export an `enhanceApp` function:

```ts
export function enhanceApp() {
  // runs once on client & server
}
```

### 2.2 Provide Types

For better DX declare `types` in your `package.json` so consumers get autocomplete when importing `@theme`.

```jsonc
{
  "name": "athen-theme-carbon",
  "types": "dist/index.d.ts"
}
```

## 3. CLI Helper (`athen theme add`)

> Coming soon in v2.0.  This command will install & register a theme package in one step:
>
> ```bash
> npx athen theme add athen-theme-carbon
> ```
>
> After installation it automatically updates `athen.config.ts`.

## 4. Fallback Strategy

If `theme` is **not** specified, Athen uses its built-in default theme so existing projects continue to work out of the box.

## 5. Migration Notes

Projects built before v2.0 require **no** change unless you wish to switch themes.  Simply add the new `theme` field as shown above.

---

Need help?  [Open an issue](https://github.com/estjs/athen) or join Discord 😊
