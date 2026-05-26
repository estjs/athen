import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import { collectRoutes, buildRoutesModule } from '../src/node/routes';
import type { LocaleAwareConfig } from '../src/shared/locale';
import type { RouteOptions } from '../src/shared/types';

let root = '';

const writeProject = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), 'athen-route-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(dir, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return dir;
};

function renderRouteCode(
  files: Record<string, string>,
  routeOptions?: RouteOptions,
  siteData?: LocaleAwareConfig & { title?: string },
) {
  root = writeProject(files);
  const routes = collectRoutes(root, routeOptions, siteData);
  return buildRoutesModule(routes, siteData);
}

describe('route service', () => {
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('scans files with default include patterns and default ignores', () => {
    const code = renderRouteCode({
      'index.md': '# Index',
      'foo.tsx': 'export default () => <div/>',
      'ignore-me.txt': 'hello',
      'node_modules/bad.md': '# Bad',
    });

    expect(code).toContain('index.md');
    expect(code).toContain('foo.tsx');
    expect(code).not.toContain('ignore-me.txt');
    expect(code).not.toContain('node_modules');
  });

  it('uses the configured theme entry as the root layout', () => {
    const code = renderRouteCode({ 'index.md': '# Index' });

    expect(code).toContain("component: import('@theme')");
    expect(code).not.toContain('@theme-default/layout/index.tsx');
  });

  it('applies include and exclude patterns together', () => {
    const code = renderRouteCode(
      {
        'index.md': '# Index',
        'foo.tsx': 'export default () => <div/>',
        'bar.mdx': '# Bar',
        'secret/draft.md': '# Draft',
      },
      { include: ['**/*.md', '**/*.mdx'], exclude: ['secret/**', 'foo.tsx'] },
    );

    expect(code).toContain('index.md');
    expect(code).toContain('bar.mdx');
    expect(code).not.toContain('foo.tsx');
    expect(code).not.toContain('secret/draft.md');
  });

  it('applies route prefixes and extension-only scanning', () => {
    const code = renderRouteCode(
      {
        'index.md': '# Index',
        'guide/start.mdx': '# Start',
        'demo.tsx': 'export default () => <div/>',
      },
      { prefix: 'reference', extensions: ['md', '.mdx'] },
    );

    expect(code).toContain('path: "/reference/"');
    expect(code).toContain('path: "/reference/guide/start"');
    expect(code).not.toContain('demo.tsx');
  });

  it('applies trailing slash url policy to generated routes', () => {
    const code = renderRouteCode(
      {
        'index.md': '# Index',
        'guide/start.md': '# Start',
      },
      { trailingSlash: true },
    );

    expect(code).toContain('path: "/"');
    expect(code).toContain('path: "/guide/start/"');
  });

  it('keeps the source prefix when each locale has an explicit URL prefix', () => {
    const code = renderRouteCode(
      {
        'en/index.md': '# Index',
        'en/guide/getting-started.md': '# Getting Started',
        'zh/index.md': '# 首页',
      },
      undefined,
      {
        lang: 'en-US',
        title: 'Docs',
        locales: {
          '/zh/': { lang: 'zh' },
          '/en/': { lang: 'en' },
        },
      } as LocaleAwareConfig & { title?: string },
    );

    expect(code).toContain('path: "/en/"');
    expect(code).toContain('path: "/en/guide/getting-started"');
    expect(code).toContain('path: "/zh/"');
    expect(code).not.toContain('path: "/guide/getting-started"');
  });

  it('keeps the root locale at the site root', () => {
    const code = renderRouteCode(
      {
        'index.md': '# Home',
        'guide/getting-started.md': '# Getting Started',
        'zh/guide/getting-started.md': '# 快速开始',
      },
      undefined,
      {
        lang: 'en-US',
        title: 'Docs',
        locales: {
          '/': { lang: 'en' },
          '/zh/': { lang: 'zh' },
        },
      } as LocaleAwareConfig & { title?: string },
    );

    expect(code).toContain('path: "/"');
    expect(code).toContain('path: "/guide/getting-started"');
    expect(code).toContain('path: "/zh/guide/getting-started"');
  });

  it('produces idempotent output across repeated collectRoutes calls', () => {
    root = writeProject({ 'index.md': '# Index' });
    const a = buildRoutesModule(collectRoutes(root));
    const b = buildRoutesModule(collectRoutes(root));

    expect(a).toBe(b);
    expect(a.match(/path: "\/"/g)).toHaveLength(1);
  });
});
