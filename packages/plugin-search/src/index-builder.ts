import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
// FlexSearch v0.8 提供了基于文档的索引构造器
import FlexSearch from 'flexsearch';
import globToRegExp from 'glob-to-regexp';
import type { SearchOptions, SearchResult } from './types';

export interface SearchDocument {
  id: number;
  path: string;
  title: string;
  headings: string[];
  content: string;
}

export class SearchIndexBuilder {
  private documents: SearchDocument[] = [];
  private options: SearchOptions;
  private md: MarkdownIt;
  private index: any;

  constructor(options: SearchOptions = {}) {
    this.options = {
      transformResult: results => results,
      searchIndexPath: '/search-index',
      include: ['**/*.md'],
      exclude: [],
      searchOptions: {
        limit: 7,
        enrich: true,
        suggest: true,
      },
      customFields: {},
      ...options,
    };

    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });

    // 使用 flexsearch 文档模式
    // @ts-ignore - flexsearch 类型定义目前对 document 选项支持不完整
    this.index = FlexSearch({
      preset: 'score',
      tokenize: 'forward',
      resolution: 9,
      document: {
        id: 'id',
        field: ['title', 'content', 'headings'],
        store: ['path', 'title'],
      },
    });
  }

  /**
   * Check if a file should be included based on include/exclude patterns
   */
  private shouldIncludeFile(filePath: string): boolean {
    const include = this.options.include ?? ['**/*.md'];
    const exclude = this.options.exclude ?? [];

    // First check excludes
    for (const pattern of exclude) {
      const regex = globToRegExp(pattern);
      if (regex.test(filePath)) return false;
    }

    // Then check includes
    for (const pattern of include) {
      const regex = globToRegExp(pattern);
      if (regex.test(filePath)) return true;
    }

    return false;
  }

  /**
   * Extract content from markdown file
   */
  private extractContent(content: string): {
    title: string;
    headings: string[];
    content: string;
  } {
    // Simple heading extraction logic
    const titleMatch = content.match(/^#\s+(.*)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Extract headings
    const headingsRegex = /^(#{2,6})\s+(.*)$/gm;
    const headings: string[] = [];
    let match;
    while ((match = headingsRegex.exec(content)) !== null) {
      headings.push(match[2].trim());
    }

    // Remove HTML and simplify content for indexing
    const cleanContent = this.md
      .render(content)
      .replaceAll(/<[^>]*>/g, ' ') // Remove HTML tags
      .replaceAll(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return { title, headings, content: cleanContent };
  }

  /**
   * Add a document to the index
   */
  addDocument(filePath: string, content: string): void {
    if (!this.shouldIncludeFile(filePath)) {
      return;
    }

    const { title, headings, content: cleanContent } = this.extractContent(content);

    const doc: SearchDocument = {
      id: this.documents.length + 1,
      path: filePath.replace(/\.(md|mdx)$/, ''),
      title,
      headings,
      content: cleanContent,
    };

    this.documents.push(doc);
    this.index.add(doc);
  }

  /**
   * Add multiple documents from a directory
   */
  addDocumentsFromDirectory(dir: string, baseDir: string = ''): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.addDocumentsFromDirectory(filePath, baseDir);
      } else if (
        (file.endsWith('.md') || file.endsWith('.mdx')) &&
        this.shouldIncludeFile(path.relative(baseDir, filePath))
      ) {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.addDocument(path.relative(baseDir, filePath), content);
      }
    }
  }

  /**
   * Search the index
   */
  search(query: string): SearchResult[] {
    const rawResults = this.index.search(query, this.options.searchOptions ?? {});

    const results: SearchResult[] = rawResults
      .map((hit: any) => {
        const doc = this.documents.find(d => d.id === hit.id);
        if (!doc) return null;

        // Find relevant content snippet
        let content = '';
        if (doc.content) {
          const lowerQuery = query.toLowerCase();
          const lowerContent = doc.content.toLowerCase();
          const index = lowerContent.indexOf(lowerQuery);

          if (index !== -1) {
            const start = Math.max(0, index - 40);
            const end = Math.min(doc.content.length, index + query.length + 40);
            content =
              (start > 0 ? '...' : '') +
              doc.content.slice(start, end) +
              (end < doc.content.length ? '...' : '');
          }
        }

        return {
          path: doc.path,
          title: doc.title,
          heading: doc.headings[0],
          content,
        };
      })
      .filter(Boolean) as SearchResult[];

    return this.options.transformResult ? this.options.transformResult(results) : results;
  }

  /**
   * Generate search index data for client side
   */
  generateSearchIndex(): string {
    return JSON.stringify({
      documents: this.documents,
      options: this.options,
    });
  }
}
