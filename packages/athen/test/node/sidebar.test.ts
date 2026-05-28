import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import { collectRoutes } from '../../src/node/routes';
import { buildSidebar, resolveSidebarConfig } from '../../src/node/sidebar';

let root = '';

const writeProject = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), 'athen-sidebar-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(dir, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return dir;
};

describe('filesystem sidebar', () => {
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('generates sidebar groups from the filesystem', () => {
    root = writeProject({
      'guide/index.md': '# Guide',
      'guide/getting-started.md': '---\ntitle: Getting Started\n---\n# Start',
      'guide/hidden.md': '---\nsidebar: false\n---\n# Hidden',
      'api/config.md': '# Config',
    });

    const meta = collectRoutes(root);
    const sidebar = buildSidebar(root, meta);

    // Hidden routes are excluded; index.md is included
    expect(sidebar['/api/']).toEqual([
      { text: 'Api', items: [{ text: 'Config', link: '/api/config' }], collapsed: undefined },
    ]);
    expect(sidebar['/guide/'][0].text).toBe('Guide');
    expect(sidebar['/guide/'][0].items).toContainEqual({
      text: 'Getting Started',
      link: '/guide/getting-started',
    });
    expect(sidebar['/guide/'][0].items).toContainEqual({ text: 'Guide', link: '/guide/' });
  });

  it('orders sidebar items by frontmatter order before falling back to name', () => {
    root = writeProject({
      'guide/intro.md': '---\norder: 1\n---\n# Intro',
      'guide/install.md': '---\norder: 2\n---\n# Install',
      'guide/reference.md': '# Reference',
      'guide/advanced.md': '---\norder: 10\n---\n# Advanced',
    });

    const meta = collectRoutes(root);
    const sidebar = buildSidebar(root, meta);

    expect(sidebar['/guide/'][0].items).toEqual([
      { text: 'Intro', link: '/guide/intro' },
      { text: 'Install', link: '/guide/install' },
      { text: 'Advanced', link: '/guide/advanced' },
      { text: 'Reference', link: '/guide/reference' },
    ]);
  });

  it('respects _meta.json items order and title overrides', () => {
    root = writeProject({
      'guide/intro.md': '# Intro',
      'guide/install.md': '# Install',
      'guide/_meta.json': JSON.stringify({
        title: 'Get Started',
        items: ['install', 'intro'],
      }),
    });

    const meta = collectRoutes(root);
    const sidebar = buildSidebar(root, meta);

    expect(sidebar['/guide/'][0].text).toBe('Get Started');
    expect(sidebar['/guide/'][0].items).toEqual([
      { text: 'Install', link: '/guide/install' },
      { text: 'Intro', link: '/guide/intro' },
    ]);
  });

  it('groups locale-prefixed sidebars under the locale prefix', () => {
    root = writeProject({
      'zh/guide/intro.md': '---\norder: 1\n---\n# 介绍',
      'zh/guide/install.md': '---\norder: 2\n---\n# 安装',
      'zh/api/config.md': '# 配置',
      'fr/guide/intro.md': '# Introduction',
    });

    const meta = collectRoutes(root, undefined, {
      locales: {
        '/zh/': { label: '简体中文', lang: 'zh' },
        '/fr/': { label: 'Français', lang: 'fr' },
      },
    });
    const sidebar = buildSidebar(root, meta, 'zh');

    expect(sidebar['/zh/api/']).toEqual([
      { text: 'Api', items: [{ text: '配置', link: '/zh/api/config' }], collapsed: undefined },
    ]);
    expect(sidebar['/zh/guide/'][0].items).toEqual([
      { text: '介绍', link: '/zh/guide/intro' },
      { text: '安装', link: '/zh/guide/install' },
    ]);
  });

  it('supports mixed auto and manual sidebar config via resolveSidebarConfig', () => {
    root = writeProject({
      'guide/index.md': '# Guide',
      'guide/getting-started.md': '# Getting Started',
      'api/config.md': '# Config',
    });

    const meta = collectRoutes(root);
    const auto = buildSidebar(root, meta);
    const sidebar = resolveSidebarConfig(
      {
        '/guide/': 'auto',
        '/api/': [{ text: 'Manual API', items: [{ text: 'Config', link: '/api/config' }] }],
      },
      auto,
    );

    expect(sidebar['/api/']).toEqual([
      { text: 'Manual API', items: [{ text: 'Config', link: '/api/config' }] },
    ]);
    expect(sidebar['/guide/'][0].text).toBe('Guide');
  });
});
