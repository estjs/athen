import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SearchIndexBuilder } from '../src/index-builder';

describe('searchIndexBuilder', () => {
  let builder: SearchIndexBuilder;
  let tempDir: string | null = null;

  beforeEach(() => {
    builder = new SearchIndexBuilder();
  });

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      expect(builder.getDocumentsCount()).toBe(0);
    });

    it('should accept custom options', () => {
      const customBuilder = new SearchIndexBuilder({
        include: ['**/*.mdx'],
        exclude: ['**/draft/**'],
        searchOptions: { limit: 10 },
      });
      expect(customBuilder.getDocumentsCount()).toBe(0);
    });
  });

  describe('addDocument', () => {
    it('should add document and extract title from frontmatter', () => {
      const markdown = `---
title: Test Page
---

# Introduction

This is a test document.
`;
      builder.addDocument('test.md', markdown);
      expect(builder.getDocumentsCount()).toBe(1);

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].title).toBe('Test Page');
    });

    it('should extract title from first heading if no frontmatter', () => {
      builder.addDocument('test.md', '# My Title\n\nContent here.');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].title).toBe('My Title');
    });

    it('should extract headings', () => {
      const markdown = `# Title

## Getting Started

### Installation

## Usage
`;
      builder.addDocument('test.md', markdown);

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].headings).toContain('Getting Started');
      expect(index.documents[0].headings).toContain('Installation');
      expect(index.documents[0].headings).toContain('Usage');
    });

    it('should generate correct path without extension', () => {
      builder.addDocument('guide/getting-started.md', '# Guide');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].path).toBe('/guide/getting-started');
    });

    it('should handle index files', () => {
      builder.addDocument('guide/index.md', '# Guide Index');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].path).toBe('/guide/');
    });

    it('should strip HTML from content', () => {
      builder.addDocument(
        'test.md',
        '# Title\n\n<div class="note">Important</div>\n\nText content.',
      );

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].content).not.toContain('<div');
      expect(index.documents[0].content).toContain('Important');
    });

    it('should normalize Windows paths before generating routes', () => {
      builder.addDocument('guide\\intro\\index.mdx', '# Intro');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].path).toBe('/guide/intro/');
    });

    it('should fall back to Untitled when no title source exists', () => {
      builder.addDocument('notes.md', 'Plain content without a heading.');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].title).toBe('Untitled');
    });
  });

  describe('include/exclude patterns', () => {
    it('should include .md files by default', () => {
      builder.addDocument('guide.md', '# Guide');
      expect(builder.getDocumentsCount()).toBe(1);
    });

    it('should include .mdx files by default', () => {
      builder.addDocument('component.mdx', '# Component');
      expect(builder.getDocumentsCount()).toBe(1);
    });

    it('should exclude files matching exclude patterns', () => {
      const customBuilder = new SearchIndexBuilder({
        include: ['**/*.md'],
        exclude: ['**/private/**'],
      });

      customBuilder.addDocument('public/doc.md', '# Public');
      customBuilder.addDocument('private/secret.md', '# Secret');

      expect(customBuilder.getDocumentsCount()).toBe(1);
    });

    it('should only include files matching include patterns', () => {
      const customBuilder = new SearchIndexBuilder({
        include: ['**/*.md'],
        exclude: ['src/**'],
      });

      customBuilder.addDocument('docs/guide.md', '# Guide');
      customBuilder.addDocument('src/readme.md', '# Readme');

      expect(customBuilder.getDocumentsCount()).toBe(1);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      builder.addDocument(
        'guide.md',
        '# Getting Started Guide\n\nThis is a comprehensive guide about FlexSearch integration.',
      );
      builder.addDocument('api.md', '# API Reference\n\nAPI documentation for developers.');
      builder.addDocument('faq.md', '# FAQ\n\nFrequently asked questions about the project.');
    });

    it('should return empty array for empty query', async () => {
      const results = await builder.search('');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const results = await builder.search('   ');
      expect(results).toEqual([]);
    });

    it('should find documents by title', async () => {
      const results = await builder.search('guide');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Getting Started Guide');
    });

    it('should find documents by content', async () => {
      const results = await builder.search('FlexSearch');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return content snippet with query highlighted', async () => {
      const results = await builder.search('comprehensive');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('comprehensive');
    });

    it('should respect limit option', async () => {
      const customBuilder = new SearchIndexBuilder({
        searchOptions: { limit: 1 },
      });
      customBuilder.addDocument('a.md', '# Test A\n\nTest content.');
      customBuilder.addDocument('b.md', '# Test B\n\nTest content.');
      customBuilder.addDocument('c.md', '# Test C\n\nTest content.');

      const results = await customBuilder.search('Test');
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should include matched heading in search results', async () => {
      const customBuilder = new SearchIndexBuilder();
      customBuilder.addDocument('guide.md', '# Guide\n\n## Advanced Search\n\nBody text.');

      const results = await customBuilder.search('Advanced');

      expect(results[0]).toMatchObject({
        path: '/guide',
        title: 'Guide',
        heading: 'Advanced Search',
      });
    });

    it('should create the same result shape for latin and cjk matches', async () => {
      const customBuilder = new SearchIndexBuilder({
        searchOptions: { limit: 2 },
      });
      customBuilder.addDocument(
        'zh/search.md',
        '# 搜索指南\n\n## 中文检索\n\n本项目支持中文内容搜索和结果摘要。',
      );

      const results = await customBuilder.search('中文');

      expect(results[0]).toMatchObject({
        path: '/zh/search',
        title: '搜索指南',
        heading: '中文检索',
      });
      expect(results[0].content).toContain('中文');
    });
  });

  describe('addDocumentsFromDirectory', () => {
    it('should recursively add markdown documents from a directory', () => {
      tempDir = mkdtempSync(join(tmpdir(), 'athen-search-test-'));
      mkdirSync(join(tempDir, 'guide'), { recursive: true });
      writeFileSync(join(tempDir, 'index.md'), '# Home\n\nWelcome');
      writeFileSync(join(tempDir, 'guide', 'intro.mdx'), '# Intro\n\nGetting started');
      writeFileSync(join(tempDir, 'guide', 'ignored.txt'), '# Ignored');

      builder.addDocumentsFromDirectory(tempDir, tempDir);

      const index = JSON.parse(builder.generateSearchIndex());
      expect(builder.getDocumentsCount()).toBe(2);
      expect(index.documents.map((doc: any) => doc.path).sort()).toEqual(['/guide/intro', '/index']);
    });

    it('should ignore missing directories', () => {
      builder.addDocumentsFromDirectory('/path/that/does/not/exist');

      expect(builder.getDocumentsCount()).toBe(0);
    });
  });

  describe('cJK support', () => {
    it('should index Chinese content', async () => {
      builder.addDocument('zh/guide.md', '# 入门指南\n\n这是一个中文文档，介绍如何使用本项目。');
      expect(builder.getDocumentsCount()).toBe(1);

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].title).toBe('入门指南');
    });

    it('should index Japanese content', async () => {
      builder.addDocument('ja/guide.md', '# はじめに\n\nこれは日本語のドキュメントです。');
      expect(builder.getDocumentsCount()).toBe(1);
    });

    it('should index Korean content', async () => {
      builder.addDocument('ko/guide.md', '# 시작하기\n\n한국어 문서입니다.');
      expect(builder.getDocumentsCount()).toBe(1);
    });
  });

  describe('generateSearchIndex', () => {
    it('should generate valid JSON', () => {
      builder.addDocument('test.md', '# Test\n\nContent');

      const json = builder.generateSearchIndex();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include documents array', () => {
      builder.addDocument('test.md', '# Test\n\nContent');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(Array.isArray(index.documents)).toBe(true);
      expect(index.documents.length).toBe(1);
    });

    it('should include options', () => {
      builder.addDocument('test.md', '# Test\n\nContent');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.options).toBeDefined();
    });

    it('should include rawHeaders with depth info', () => {
      builder.addDocument('test.md', '# Title\n\n## Section\n\n### Subsection');

      const index = JSON.parse(builder.generateSearchIndex());
      expect(index.documents[0].rawHeaders).toBeDefined();
      expect(index.documents[0].rawHeaders.length).toBe(2);
      expect(index.documents[0].rawHeaders[0].depth).toBe(2);
      expect(index.documents[0].rawHeaders[1].depth).toBe(3);
    });
  });
});
