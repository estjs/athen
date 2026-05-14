import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import {
  createSearchIndexes,
  matchesGlob,
  normalizeDocumentPath,
  resolveSearchLimit,
  searchDocuments,
  type SearchIndexes,
} from './search-core';
import type { SearchDocument, SearchOptions, SearchResult } from './types';

export class SearchIndexBuilder {
  private documents: SearchDocument[] = [];
  private options: SearchOptions;
  private md: MarkdownIt;
  private indexes: SearchIndexes;

  constructor(options: SearchOptions = {}) {
    this.options = {
      include: ['**/*.md', '**/*.mdx'],
      exclude: [],
      searchOptions: { limit: 7, enrich: true, suggest: true },
      ...options,
    };
    this.md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    this.indexes = createSearchIndexes();
  }

  private shouldIncludeFile(filePath: string): boolean {
    const normalizedPath = filePath.replaceAll('\\', '/');
    for (const pattern of this.options.exclude || []) {
      if (matchesGlob(pattern, normalizedPath)) return false;
    }
    for (const pattern of this.options.include || []) {
      if (matchesGlob(pattern, normalizedPath)) return true;
    }
    return false;
  }

  private extractFrontmatter(content: string): {
    frontmatter: Record<string, string>;
    content: string;
  } {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (match) {
      const frontmatter: Record<string, string> = {};
      match[1].split('\n').forEach((line) => {
        const i = line.indexOf(':');
        if (i > 0)
          frontmatter[line.slice(0, i).trim()] = line
            .slice(i + 1)
            .trim()
            .replaceAll(/^['"]|['"]$/g, '');
      });
      return { frontmatter, content: content.slice(match[0].length) };
    }
    return { frontmatter: {}, content };
  }

  private extractContent(content: string) {
    const { frontmatter, content: body } = this.extractFrontmatter(content);
    let title = frontmatter.title || 'Untitled';
    const titleMatch = body.match(/^#\s+(.*)$/m);
    if (!frontmatter.title && titleMatch) title = titleMatch[1].trim();

    const headings: string[] = [];
    const rawHeaders: NonNullable<SearchDocument['rawHeaders']> = [];
    let match: RegExpExecArray | null;
    let id = 0;
    const regex = /^(#{1,6})\s+(.*)$/gm;
    while ((match = regex.exec(body))) {
      const depth = match[1].length;
      const text = match[2].trim();
      if (depth > 1) {
        headings.push(text);
        rawHeaders.push({ id: `heading-${++id}`, text, depth });
      }
    }

    const cleanContent = this.md
      .render(body)
      .replaceAll(/<[^>]*>/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
    return { title, headings, content: cleanContent, rawHeaders };
  }

  addDocument(filePath: string, content: string): void {
    if (!this.shouldIncludeFile(filePath)) return;
    const { title, headings, content: cleanContent, rawHeaders } = this.extractContent(content);
    const doc: SearchDocument = {
      id: this.documents.length + 1,
      path: normalizeDocumentPath(filePath),
      title,
      headings,
      content: cleanContent,
      rawHeaders,
    };
    this.documents.push(doc);
    this.indexes.index.add(doc);
    this.indexes.cjkIndex.add(doc);
  }

  addDocumentsFromDirectory(dir: string, baseDir: string = ''): void {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        this.addDocumentsFromDirectory(filePath, baseDir);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const relativePath = path.relative(baseDir, filePath).replaceAll('\\', '/');
        if (this.shouldIncludeFile(relativePath)) {
          try {
            this.addDocument(relativePath, fs.readFileSync(filePath, 'utf-8'));
          } catch {}
        }
      }
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      return searchDocuments(this.indexes, this.documents, query, {
        limit: resolveSearchLimit(this.options),
      });
    } catch {
      return [];
    }
  }

  getDocumentsCount(): number {
    return this.documents.length;
  }
  generateSearchIndex(): string {
    return JSON.stringify({ documents: this.documents, options: this.options });
  }
}
