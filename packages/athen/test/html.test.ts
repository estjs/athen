import { describe, expect, it } from 'vitest';
import {
  BASE_TEMPLATE,
  applyHtmlTransforms,
  injectIntoHtml,
  renderHeadTags,
  renderHtmlTag,
} from '../src/node/html';
import type { Plugin } from 'vite';

describe('base template', () => {
  it('has no per-page meta placeholders (title/description/lang are unhead-driven)', () => {
    expect(BASE_TEMPLATE).not.toContain('{{ title }}');
    expect(BASE_TEMPLATE).not.toContain('{{ description }}');
    expect(BASE_TEMPLATE).not.toContain('{{ lang }}');
    expect(BASE_TEMPLATE).toContain('{{ icon }}');
    expect(BASE_TEMPLATE).toContain('<div id="app">');
  });
});

describe('renderHtmlTag', () => {
  it('renders self-closing tag without children', () => {
    expect(renderHtmlTag({ tag: 'meta', attrs: { name: 'x', content: 'y' } })).toBe(
      '<meta name="x" content="y">',
    );
  });

  it('wraps string children in open/close tags', () => {
    expect(renderHtmlTag({ tag: 'script', attrs: {}, children: 'foo' })).toBe(
      '<script>foo</script>',
    );
  });

  it('renders nested array children recursively', () => {
    expect(
      renderHtmlTag({
        tag: 'div',
        attrs: { id: 'root' },
        children: [
          { tag: 'span', attrs: {}, children: 'a' },
          { tag: 'span', attrs: {}, children: 'b' },
        ],
      }),
    ).toBe('<div id="root"><span>a</span><span>b</span></div>');
  });

  it('escapes attribute values to prevent injection', () => {
    expect(renderHtmlTag({ tag: 'meta', attrs: { content: '"><script>x</script>' } })).toBe(
      '<meta content="&quot;&gt;&lt;script&gt;x&lt;/script&gt;">',
    );
  });

  it('drops attributes with false or undefined values; boolean true becomes bare flag', () => {
    expect(
      renderHtmlTag({ tag: 'input', attrs: { hidden: true, disabled: false, name: undefined } }),
    ).toBe('<input hidden>');
  });
});

describe('renderHeadTags', () => {
  it('renders a SiteData head array (3-tuple form)', () => {
    expect(
      renderHeadTags([
        ['link', { rel: 'stylesheet', href: '/a.css' }],
        ['script', { type: 'application/ld+json' }, '{"@context":"https://schema.org"}'],
      ]),
    ).toBe(
      '<link rel="stylesheet" href="/a.css">\n' +
        '<script type="application/ld+json">{"@context":"https://schema.org"}</script>',
    );
  });

  it('returns empty string for empty/missing head', () => {
    expect(renderHeadTags()).toBe('');
    expect(renderHeadTags([])).toBe('');
  });
});

describe('injectIntoHtml', () => {
  const shell = '<html><head><meta charset="utf-8"></head><body><div id="app"></div></body></html>';

  it('appends headPrepend right after <head> open tag', () => {
    const out = injectIntoHtml(shell, { headPrepend: '<meta name="prepended">' });
    expect(out).toMatch(/<head>\n<meta name="prepended"><meta charset/);
  });

  it('appends head before </head>', () => {
    const out = injectIntoHtml(shell, { head: '<link rel="stylesheet" href="/x.css">' });
    expect(out).toMatch(/<link rel="stylesheet" href="\/x.css">\n<\/head>/);
  });

  it('replaces <div id="app"></div> with rendered SSR app HTML', () => {
    const out = injectIntoHtml(shell, { app: '<main>SSR</main>' });
    expect(out).toContain('<div id="app"><main>SSR</main></div>');
  });

  it('injects bodyPrepend after <body> and body before </body>', () => {
    const out = injectIntoHtml(shell, {
      bodyPrepend: '<noscript>NS</noscript>',
      body: '<script src="/c.js"></script>',
    });
    expect(out).toMatch(/<body>\n<noscript>NS<\/noscript>/);
    expect(out).toMatch(/<script src="\/c.js"><\/script>\n<\/body>/);
  });

  it('is a no-op when no parts are provided', () => {
    expect(injectIntoHtml(shell, {})).toBe(shell);
  });
});

describe('html transforms', () => {
  it('applies Vite transformIndexHtml hooks in order and injects returned tags', async () => {
    const plugins: Plugin[] = [
      {
        name: 'pre-transform',
        transformIndexHtml: {
          order: 'pre',
          handler: (html) => html.replace('<body>', '<body><p id="pre">pre</p>'),
        },
      },
      {
        name: 'tag-transform',
        transformIndexHtml: () => [
          { tag: 'meta', attrs: { name: 'x-test', content: 'ok' }, injectTo: 'head' },
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: 'window.ok=true',
            injectTo: 'body',
          },
        ],
      },
      {
        name: 'post-transform',
        transformIndexHtml: {
          order: 'post',
          handler: (html) => ({
            html: html.replace('</body>', '<p id="post">post</p></body>'),
            tags: [],
          }),
        },
      },
    ];

    const html = await applyHtmlTransforms(
      '<html><head></head><body><main>Docs</main></body></html>',
      { path: '/', filename: '/tmp/index.html' },
      plugins,
    );

    expect(html).toContain('<p id="pre">pre</p>');
    expect(html).toContain('<meta name="x-test" content="ok">');
    expect(html).toContain('<script type="module">window.ok=true</script>');
    expect(html).toContain('<p id="post">post</p>');
  });

  it('skips serve-only and internal index-html plugins during SSG rendering', async () => {
    const html = await applyHtmlTransforms(
      '<html><head></head><body></body></html>',
      { path: '/', filename: '/tmp/index.html' },
      [
        {
          name: 'athen:index-html',
          transformIndexHtml: (html) => html.replace('</body>', 'bad</body>'),
        },
        {
          name: 'serve-only',
          apply: 'serve',
          transformIndexHtml: (html) => html.replace('</body>', 'bad</body>'),
        },
      ],
    );

    expect(html).toBe('<html><head></head><body></body></html>');
  });
});
