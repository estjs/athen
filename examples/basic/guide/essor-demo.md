# Essor Component Demo

This page shows how to inline Essor components directly in MDX. Since Athen
uses Essor as its render engine, any JSX you write is a real Essor component.

## Simple counter

```tsx live
import { signal } from 'essor';

export default function Counter() {
  const count = signal(0);
  return (
    <div style="display:flex;align-items:center;gap:12px;margin:16px 0">
      <button
        onClick={() => count.value++}
        style="padding:6px 16px;font-size:14px;cursor:pointer"
      >
        +1
      </button>
      <span style="font-size:18px;font-weight:600">{count.value}</span>
      <button
        onClick={() => count.value--}
        style="padding:6px 16px;font-size:14px;cursor:pointer"
      >
        -1
      </button>
    </div>
  );
}
```

## Custom MDX plugin in action

The `remarkLabelTxt` plugin (defined in `guide/remarkPlugin.ts`) tags every
`txt` fenced code block with a `label="Executable"` meta string:

```txt
echo "This txt block gets the Executable label via the custom remark plugin"
```

Any other language is left alone:

```bash
echo "This one stays standard"
```

## Reference

- Athen bundles Essor at build time — no extra import needed.
- Custom remark / rehype plugins are prepended to the built-in pipeline.
- The `remarkPlugins` array accepts any unist-compatible plugin.
