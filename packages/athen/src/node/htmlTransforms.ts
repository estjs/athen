import type {
  HtmlTagDescriptor,
  IndexHtmlTransformContext,
  IndexHtmlTransformHook,
  Plugin,
  PluginOption,
} from 'vite';

export function flattenPlugins(plugins: PluginOption[] = []): Plugin[] {
  const result: Plugin[] = [];

  const visit = (plugin: PluginOption): void => {
    if (!plugin) return;
    if (Array.isArray(plugin)) {
      plugin.forEach(visit);
      return;
    }
    if (typeof plugin === 'object' && 'then' in plugin) return;

    result.push(plugin as Plugin);
  };

  plugins.forEach(visit);
  return result;
}

function escapeHtmlAttr(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderHtmlTag(tag: HtmlTagDescriptor): string {
  const attrs = Object.entries(tag.attrs ?? {})
    .filter(([, value]) => value !== false && value !== undefined)
    .map(([key, value]) => (value === true ? key : `${key}="${escapeHtmlAttr(String(value))}"`))
    .join(' ');
  const openTag = `<${tag.tag}${attrs ? ` ${attrs}` : ''}>`;

  if (tag.children == null) {
    return openTag;
  }

  const children = Array.isArray(tag.children)
    ? tag.children.map(renderHtmlTag).join('')
    : tag.children;

  return `${openTag}${children}</${tag.tag}>`;
}

function injectHtmlAt(
  html: string,
  content: string,
  tagName: 'head' | 'body',
  position: 'prepend' | 'append',
) {
  if (!content) return html;

  if (position === 'prepend') {
    const match = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'i'));
    if (!match || match.index == null) return `${content}\n${html}`;

    const index = match.index + match[0].length;
    return `${html.slice(0, index)}\n${content}${html.slice(index)}`;
  }

  const match = html.match(new RegExp(`</${tagName}>`, 'i'));
  if (!match || match.index == null) return `${html}\n${content}`;

  return `${html.slice(0, match.index)}${content}\n${html.slice(match.index)}`;
}

function injectHtmlTags(html: string, tags: HtmlTagDescriptor[]) {
  if (!tags.length) return html;

  const groupedTags = {
    headPrepend: [] as string[],
    head: [] as string[],
    bodyPrepend: [] as string[],
    body: [] as string[],
  };

  for (const tag of tags) {
    const rendered = renderHtmlTag(tag);
    switch (tag.injectTo) {
      case 'head':
        groupedTags.head.push(rendered);
        break;
      case 'body-prepend':
        groupedTags.bodyPrepend.push(rendered);
        break;
      case 'body':
        groupedTags.body.push(rendered);
        break;
      case 'head-prepend':
      default:
        groupedTags.headPrepend.push(rendered);
        break;
    }
  }

  let result = html;
  result = injectHtmlAt(result, groupedTags.headPrepend.join('\n'), 'head', 'prepend');
  result = injectHtmlAt(result, groupedTags.head.join('\n'), 'head', 'append');
  result = injectHtmlAt(result, groupedTags.bodyPrepend.join('\n'), 'body', 'prepend');
  result = injectHtmlAt(result, groupedTags.body.join('\n'), 'body', 'append');
  return result;
}

function getHtmlTransformHooks(plugins: Plugin[], order?: 'pre' | 'post'): IndexHtmlTransformHook[] {
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

export async function applyHtmlTransforms(
  html: string,
  ctx: IndexHtmlTransformContext,
  plugins: Plugin[],
) {
  if (!plugins.length) return html;

  let result = html;
  const tags: HtmlTagDescriptor[] = [];
  const hooks = [
    ...getHtmlTransformHooks(plugins, 'pre'),
    ...getHtmlTransformHooks(plugins),
    ...getHtmlTransformHooks(plugins, 'post'),
  ];

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

  return injectHtmlTags(result, tags);
}
