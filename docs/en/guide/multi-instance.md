# Multi-Instance Sites

Athen supports hosting **multiple documentation sites in a single repository**.  Typical scenarios:

1. Monorepo with several packages, each needs its own docs.
2. Product documentation (Marketing, DevDocs, API) maintained together.

---

## Configuration

Add an `instances` field in your root `athen.config.ts`:

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  // root level config (optional)
  title: 'Docs Portal',

  instances: [
    {
      root: 'docs/core',  // sub-folder path
      base: '/core/'      // public base path
    },
    {
      root: 'docs/sdk',
      base: '/sdk/'
    }
  ]
});
```

Each instance must contain its own `athen.config.ts` or will inherit the root config.

### CLI Usage

```bash
# Build all instances
pnpm docs:build  # internally loops through instances

# Dev single instance
athen dev docs/core
```

> Tip: combine with `turbo run dev --filter=docs/*` for parallel serve.

---

## Output Structure

```
root
└─ dist
   ├─ core
   │  └─ index.html
   └─ sdk
      └─ index.html
```

Each sub-site has its own `sitemap.xml` & `search-index.json`.

---

## Limitations

* Instances **cannot be nested**.
* Cross-instance links are not rewritten automatically; use absolute `base`.
* Dev server currently runs **one instance at a time** (choose via CLI path).

Improvements like unified multi-proxy dev server are tracked in the roadmap.

## Development Workflow

During development you usually want to preview **one** instance at a time:

```bash
# Serve docs for `docs/core`
athen dev docs/core
```

If you would like to spin up all instances simultaneously (for example in a monorepo), combine Athen with a task-runner such as **Turbo**:

```bash
# package.json script inside each docs package, e.g. docs/core/package.json
{
  "scripts": {
    "dev": "athen dev ."
  }
}

# Root command – start every docs/* workspace in parallel
pnpm turbo run dev --filter=docs/*
```

This starts multiple dev servers on incremental ports (8730, 8731, …) so you can preview them side-by-side.

## Common Pitfalls

* **Cross-instance links** – Athen does **not** rewrite relative links between instances. Use an **absolute `base` path** (e.g. `/sdk/`) when linking from *Core* docs into *SDK* docs.
* **Nested instances** are not supported – their `root` folders must be siblings, not children of each other.
* Remember that `athen build` always outputs to `dist/<base>`; make sure your hosting provider allows such sub-folders.
