# Analytics

Athen can automatically inject analytics snippets during **build** (and in dev for quick testing).  No third-party script will be included unless you explicitly opt-in via the `analytics` field in the root config.

## 1. Enable a Provider

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  analytics: {
    google: { id: 'G-XXXXXXX' },        // Google Analytics 4
  }
});
```

Supported providers out of the box:

| Key        | What is injected                                  | Required fields |
| ---------- | -------------------------------------------------- | --------------- |
| `google`   | GA4 gtag snippet                                   | `id`            |
| `baidu`    | Baidu Tongji                                      | `id`            |
| `tencent`  | Tencent Beacon                                     | `sid`, `cid`    |
| `ali`      | CNZZ / Ali analysis                                | `id`            |
| `plausible`| Plausible script (self-host or cloud)              | `domain`        |
| `umami`    | Umami script                                       | `id`, `src`     |
| `ackee`    | Ackee tracker                                      | `server`, `domainId` |
| `vercel`   | Vercel analytics (inline script)                   | `id`            |
| `custom`   | Any custom snippet (string)                        | `snippet`       |

You can combine multiple providers – Athen will inject **all** configured scripts:

```ts
analytics: {
  google: { id: 'G-123456' },
  umami:  { id: 'abc', src: 'https://analytics.example.com/script.js' }
}
```

## 2. Disable Analytics

Set the field to `false`:

```ts
export default defineConfig({
  analytics: false
});
```

This prevents the optional `plugin-analytics` from being imported so there is **zero runtime overhead**.

## 3. Override or Extend

Because analytics is implemented as an **optional built-in plugin**, you may fully override it by providing a plugin with the same `name` inside `plugins`:

```ts
export default defineConfig({
  plugins: [
    {
      name: 'athen-plugin-analytics',
      transformIndexHtml(html) {
        // insert your own snippet
        return html.replace('</head>', '<script>/* … */</script></head>');
      }
    }
  ]
});
```

Alternatively, for simple tweaks you can keep the built-in plugin enabled and add another plugin with `enforce: 'post'` to adjust the generated HTML.

## 4. Environment Safety

Athen only injects analytics **during `build`** by default.  If you wish to debug locally, set `ANALYTICS_DEBUG=1` in your env – the plugin will output added tags in the terminal for quick verification.

```bash
ANALYTICS_DEBUG=1 pnpm run dev
```

---

Need another provider?  PRs welcome or follow the “Override” guide above to ship your own implementation!
