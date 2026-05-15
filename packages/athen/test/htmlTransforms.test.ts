import { describe, expect, it } from 'vitest';
import { applyHtmlTransforms } from '../src/node/htmlTransforms';
import type { Plugin } from 'vite';

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
