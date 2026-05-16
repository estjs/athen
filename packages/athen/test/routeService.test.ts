import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import { RouteService } from '../src/node/plugins/router/routeService';

let root = '';

const writeProject = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'athen-route-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(root, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return root;
};

function renderRouteCode(
  files: Record<string, string>,
  routeOptions?: Parameters<RouteService['init']>[0],
  siteData?: Parameters<RouteService['init']>[1],
) {
  root = writeProject(files);
  const routeService = new RouteService(root);
  routeService.init(routeOptions, siteData);
  return routeService.generateRoutesCode(siteData);
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
    const code = renderRouteCode({
      'index.md': '# Index',
    });

    expect(code).toContain("component: import('@theme')");
    expect(code).not.toContain("@theme-default/layout/index.tsx");
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

  it('maps files under the configured locale prefix to root routes', () => {
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
        themeConfig: {
          locales: {
            '/zh/': { lang: 'zh' },
            '/en/': { lang: 'en' },
          },
        },
      },
    );

    expect(code).toContain('path: "/"');
    expect(code).toContain('path: "/guide/getting-started"');
    expect(code).toContain('path: "/zh/"');
    expect(code).not.toContain('path: "/en/"');
    expect(code).not.toContain('path: "/en/guide/getting-started"');
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
        themeConfig: {
          locales: {
            '/': { lang: 'en' },
            '/zh/': { lang: 'zh' },
          },
        },
      },
    );

    expect(code).toContain('path: "/"');
    expect(code).toContain('path: "/guide/getting-started"');
    expect(code).toContain('path: "/zh/guide/getting-started"');
  });

  it('resets route data when init runs more than once', () => {
    const code = renderRouteCode({ 'index.md': '# Index' });
    const routeService = new RouteService(root);
    routeService.init();
    routeService.init();
    const rerenderedCode = routeService.generateRoutesCode();

    expect(code.match(/path: "\/"/g)).toHaveLength(1);
    expect(rerenderedCode.match(/path: "\/"/g)).toHaveLength(1);
  });
});
