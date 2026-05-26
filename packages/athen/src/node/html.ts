import { join } from 'node:path';
import fs from 'fs-extra';
import type {
  HtmlTagDescriptor,
  IndexHtmlTransformContext,
  IndexHtmlTransformHook,
  Plugin,
  PluginOption,
} from 'vite';
import type { HeadConfig } from '../shared/types';

// ---------------------------------------------------------------------------
// Base HTML template
// ---------------------------------------------------------------------------

/**
 * The shell document Athen wraps every page in. Title, description, and the
 * `<html lang>` attribute are NOT placeholders here — they are injected at
 * render time by Unhead (`transformHtmlTemplate` for SSG / dev middleware,
 * the DOM renderer for SPA navigation). The only template var left is
 * `{{ favicon }}`, populated from `siteData.favicon`.
 *
 * Users can override the whole document by dropping their own at
 * `<root>/index.html`.
 */
export const BASE_TEMPLATE = `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Athen">
  <link rel="icon" href="{{ favicon }}">
</head>

<body>
  <div id="app"></div>
</body>

</html>
`;

/**
 * Resolve the document shell for a given project root. Returns the user's
 * `<root>/index.html` if it exists, falling back to the bundled
 * `BASE_TEMPLATE` string so the package doesn't need to ship a static file.
 */
export async function resolveBaseTemplate(root: string): Promise<string> {
  const userTemplate = join(root, 'index.html');
  return (await fs.pathExists(userTemplate)) ? fs.readFile(userTemplate, 'utf-8') : BASE_TEMPLATE;
}

// ---------------------------------------------------------------------------
// Tag rendering
// ---------------------------------------------------------------------------

const HTML_ATTR_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
};

function serializeAttrs(attrs?: Record<string, unknown>) {
  if (!attrs) return '';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === undefined) continue;
    const escaped = String(value).replaceAll(/[&"<>]/g, (c) => HTML_ATTR_ESCAPE[c]);
    parts.push(value === true ? key : `${key}="${escaped}"`);
  }
  return parts.length ? ` ${parts.join(' ')}` : '';
}

/** Render a Vite `HtmlTagDescriptor` (used by `applyHtmlTransforms`). */
export function renderHtmlTag(tag: HtmlTagDescriptor): string {
  const open = `<${tag.tag}${serializeAttrs(tag.attrs as Record<string, unknown>)}>`;
  if (tag.children == null) return open;
  const children = Array.isArray(tag.children)
    ? tag.children.map(renderHtmlTag).join('')
    : tag.children;
  return `${open}${children}</${tag.tag}>`;
}

/**
 * Render a `SiteData['head']` array (the user-config 3-tuple form) as a
 * string of HTML tags ready to inject into `<head>`.
 */
export function renderHeadTags(head: HeadConfig[] = []) {
  return head
    .map(([tag, attrs, children]) => {
      const open = `<${tag}${serializeAttrs(attrs as Record<string, unknown>)}>`;
      return children == null ? open : `${open}${children}</${tag}>`;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// HTML mutation
// ---------------------------------------------------------------------------

export interface HtmlInjection {
  headPrepend?: string;
  head?: string;
  bodyPrepend?: string;
  body?: string;
  /** SSR/SSG output to substitute into `<div id="app"></div>`. */
  app?: string;
}

function injectHtmlAt(
  html: string,
  tag: 'head' | 'body',
  content: string,
  position: 'after-open' | 'before-close',
) {
  if (!content) return html;
  if (position === 'after-open') {
    const m = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'i'));
    if (!m || m.index == null) return `${content}\n${html}`;
    const i = m.index + m[0].length;
    return `${html.slice(0, i)}\n${content}${html.slice(i)}`;
  }
  const closeTag = `</${tag}>`;
  const i = html.toLowerCase().lastIndexOf(closeTag);
  if (i === -1) return `${html}\n${content}`;
  return `${html.slice(0, i)}${content}\n${html.slice(i)}`;
}

function injectAppRoot(html: string, appHtml: string) {
  return html.replace(/<div\s+id="app"\s*>\s*<\/div>/i, `<div id="app">${appHtml}</div>`);
}

/** Compose all standard injection points onto a single HTML document. */
export function injectIntoHtml(html: string, parts: HtmlInjection): string {
  let out = html;
  if (parts.headPrepend) out = injectHtmlAt(out, 'head', parts.headPrepend, 'after-open');
  if (parts.head) out = injectHtmlAt(out, 'head', parts.head, 'before-close');
  if (parts.app !== undefined) out = injectAppRoot(out, parts.app);
  if (parts.bodyPrepend) out = injectHtmlAt(out, 'body', parts.bodyPrepend, 'after-open');
  if (parts.body) out = injectHtmlAt(out, 'body', parts.body, 'before-close');
  return out;
}

// ---------------------------------------------------------------------------
// Plugin pipeline
// ---------------------------------------------------------------------------

export function flattenPlugins(plugins: PluginOption[] = []): Plugin[] {
  const out: Plugin[] = [];
  const visit = (p: PluginOption): void => {
    if (!p) return;
    if (Array.isArray(p)) return p.forEach(visit);
    if (typeof p === 'object' && 'then' in p) return;
    out.push(p as Plugin);
  };
  plugins.forEach(visit);
  return out;
}

function getTransformHooks(plugins: Plugin[], order?: 'pre' | 'post'): IndexHtmlTransformHook[] {
  const hooks: IndexHtmlTransformHook[] = [];
  for (const plugin of plugins) {
    if (plugin.name === 'athen:index-html' || plugin.apply === 'serve') continue;
    const transform = plugin.transformIndexHtml;
    if (!transform) continue;
    const transformOrder = typeof transform === 'function' ? undefined : transform.order;
    if ((order && transformOrder !== order) || (!order && transformOrder)) continue;
    hooks.push(typeof transform === 'function' ? transform : transform.handler);
  }
  return hooks;
}

function groupTags(tags: HtmlTagDescriptor[]): HtmlInjection {
  const acc = {
    headPrepend: [] as string[],
    head: [] as string[],
    bodyPrepend: [] as string[],
    body: [] as string[],
  };
  for (const tag of tags) {
    const rendered = renderHtmlTag(tag);
    switch (tag.injectTo) {
      case 'head':
        acc.head.push(rendered);
        break;
      case 'body-prepend':
        acc.bodyPrepend.push(rendered);
        break;
      case 'body':
        acc.body.push(rendered);
        break;
      default:
        acc.headPrepend.push(rendered);
        break;
    }
  }
  return {
    headPrepend: acc.headPrepend.join('\n'),
    head: acc.head.join('\n'),
    bodyPrepend: acc.bodyPrepend.join('\n'),
    body: acc.body.join('\n'),
  };
}

export async function applyHtmlTransforms(
  html: string,
  ctx: IndexHtmlTransformContext,
  plugins: Plugin[],
) {
  if (!plugins.length) return html;

  const hooks = [
    ...getTransformHooks(plugins, 'pre'),
    ...getTransformHooks(plugins),
    ...getTransformHooks(plugins, 'post'),
  ];

  let result = html;
  const tags: HtmlTagDescriptor[] = [];
  for (const hook of hooks) {
    const transformed = await hook.call({} as never, result, ctx);
    if (!transformed) continue;
    if (typeof transformed === 'string') {
      result = transformed;
      continue;
    }
    if (Array.isArray(transformed)) {
      tags.push(...transformed);
      continue;
    }
    result = transformed.html;
    tags.push(...transformed.tags);
  }
  return injectIntoHtml(result, groupTags(tags));
}
