import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import { RouteService } from '../src/node/plugins/router/routeService';

const writeProject = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'athen-route-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(root, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return root;
};

describe('RouteService', () => {
  let root = '';

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('scans files with default include patterns and default ignores', () => {
    root = writeProject({
      'index.md': '# Index',
      'foo.tsx': 'export default () => <div/>',
      'ignore-me.txt': 'hello',
      'node_modules/bad.md': '# Bad',
    });

    const routeService = new RouteService(root);
    routeService.init();

    const code = routeService.generateRoutesCode();
    expect(code).toContain('index.md');
    expect(code).toContain('foo.tsx');
    expect(code).not.toContain('ignore-me.txt'); // Wrong extension
    expect(code).not.toContain('node_modules'); // Default ignore
  });

  it('respects routeOptions.include pattern', () => {
    root = writeProject({
      'index.md': '# Index',
      'foo.tsx': 'export default () => <div/>',
      'bar.mdx': '# Bar',
    });

    const routeService = new RouteService(root);
    // Only include .md files
    routeService.init({ include: ['**/*.md'] });

    const code = routeService.generateRoutesCode();
    expect(code).toContain('index.md');
    expect(code).not.toContain('foo.tsx');
    expect(code).not.toContain('bar.mdx');
  });

  it('respects routeOptions.exclude pattern', () => {
    root = writeProject({
      'index.md': '# Index',
      'foo.tsx': 'export default () => <div/>',
      'secret/draft.md': '# Draft',
    });

    const routeService = new RouteService(root);
    // Exclude secret directory and foo.tsx
    routeService.init({ exclude: ['secret/**', 'foo.tsx'] });

    const code = routeService.generateRoutesCode();
    expect(code).toContain('index.md');
    expect(code).not.toContain('foo.tsx');
    expect(code).not.toContain('secret/draft.md');
  });

  it('maps files under the default locale directory to root routes', () => {
    root = writeProject({
      'en/index.md': '# Index',
      'en/guide/getting-started.md': '# Getting Started',
      'zh/index.md': '# 首页',
    });

    const routeService = new RouteService(root);
    routeService.init(undefined, {
      lang: 'en-US',
      title: 'Docs',
      themeConfig: {
        locales: {
          '/zh/': { lang: 'zh' },
          '/en/': { lang: 'en' },
        },
      },
    });

    const code = routeService.generateRoutesCode();
    expect(code).toContain('path: "/"');
    expect(code).toContain('path: "/guide/getting-started"');
    expect(code).toContain('path: "/zh/"');
    expect(code).not.toContain('path: "/en/"');
    expect(code).not.toContain('path: "/en/guide/getting-started"');
  });
});
