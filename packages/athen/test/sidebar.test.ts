import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';
import { collectRouteMeta } from '../src/node/plugins/router/routeService';
import { createAutoSidebar, resolveSidebar } from '../src/node/sidebar';

let root = '';

const writeProject = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'athen-sidebar-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(root, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return root;
};

describe('auto sidebar', () => {
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('generates sidebar groups from route metadata', () => {
    root = writeProject({
      'guide/index.md': '# Guide',
      'guide/getting-started.md': '---\ntitle: Getting Started\n---\n# Start',
      'guide/hidden.md': '---\nsidebar: false\n---\n# Hidden',
      'api/config.md': '# Config',
    });

    const meta = collectRouteMeta(root);

    expect(createAutoSidebar(meta)).toEqual({
      '/api/': [{ text: 'Api', items: [{ text: 'Config', link: '/api/config' }] }],
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Guide', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
    });
  });

  it('orders sidebar items by frontmatter order before falling back to route path', () => {
    root = writeProject({
      'guide/intro.md': '---\norder: 1\n---\n# Intro',
      'guide/install.md': '---\norder: 2\n---\n# Install',
      'guide/reference.md': '# Reference',
      'guide/advanced.md': '---\norder: 10\n---\n# Advanced',
    });

    const meta = collectRouteMeta(root);

    expect(createAutoSidebar(meta)['/guide/'][0].items).toEqual([
      { text: 'Intro', link: '/guide/intro' },
      { text: 'Install', link: '/guide/install' },
      { text: 'Advanced', link: '/guide/advanced' },
      { text: 'Reference', link: '/guide/reference' },
    ]);
  });

  it('groups locale-prefixed auto sidebars by section inside the locale', () => {
    root = writeProject({
      'zh/guide/intro.md': '---\norder: 1\n---\n# 介绍',
      'zh/guide/install.md': '---\norder: 2\n---\n# 安装',
      'zh/api/config.md': '# 配置',
      'fr/guide/intro.md': '# Introduction',
    });

    const meta = collectRouteMeta(root);

    expect(createAutoSidebar(meta, '/zh/')).toEqual({
      '/zh/api/': [
        {
          text: 'Zh Api',
          items: [{ text: '配置', link: '/zh/api/config' }],
        },
      ],
      '/zh/guide/': [
        {
          text: 'Zh Guide',
          items: [
            { text: '介绍', link: '/zh/guide/intro' },
            { text: '安装', link: '/zh/guide/install' },
          ],
        },
      ],
    });
  });

  it('can generate a root locale sidebar without other locale prefixes', () => {
    root = writeProject({
      'guide/intro.md': '# Intro',
      'zh/guide/intro.md': '# 介绍',
      'fr/guide/intro.md': '# Introduction',
    });

    const meta = collectRouteMeta(root);

    expect(createAutoSidebar(meta, '/', ['/zh/', '/fr/'])).toEqual({
      '/guide/': [
        {
          text: 'Guide',
          items: [{ text: 'Intro', link: '/guide/intro' }],
        },
      ],
    });
  });

  it('supports mixed auto and manual sidebar config', () => {
    root = writeProject({
      'guide/index.md': '# Guide',
      'guide/getting-started.md': '# Getting Started',
      'api/config.md': '# Config',
    });

    const meta = collectRouteMeta(root);
    const sidebar = resolveSidebar(meta, {
      '/guide/': 'auto',
      '/api/': [{ text: 'Manual API', items: [{ text: 'Config', link: '/api/config' }] }],
    });

    expect(sidebar).toEqual({
      '/api/': [{ text: 'Manual API', items: [{ text: 'Config', link: '/api/config' }] }],
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Guide', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
    });
  });
});
