import fs from 'node:fs';
import path from 'node:path';
import {
  type SearchIndexes,
  createSearchIndexes,
  matchesGlob,
  normalizeDocumentPath,
  resolveSearchLimit,
  searchDocuments,
} from './search-core';
import type { SearchDocument, SearchOptions, SearchResult } from './types';

function stripMarkdown(content: string): string {
  return (
    content
      // Remove frontmatter if present
      .replace(/^---[\s\S]*?---/, '')
      // Remove HTML comments
      .replaceAll(/<!--[\s\S]*?-->/g, '')
      // Remove JSX/TSX imports and exports
      .replaceAll(/^\s*import\s[\s\S]*?from\s+['"].*?['"];?/gm, '')
      .replaceAll(/^\s*export\s+[\s\S]*?;?/gm, '')
      // Remove code blocks
      .replaceAll(/```[\s\S]*?```/g, '')
      // Remove inline code blocks
      .replaceAll(/`([^`]+)`/g, '$1')
      // Remove HTML tags
      .replaceAll(/<[^>]*>/g, ' ')
      // Remove markdown links: [text](link) -> text
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images: ![alt](img) -> alt
      .replaceAll(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove headings: # heading -> heading
      .replaceAll(/^\s*#{1,6}\s+(.*)$/gm, '$1')
      // Remove bold/italic: **bold**, *italic* -> bold, italic
      .replaceAll(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove blockquotes: > quote -> quote
      .replaceAll(/^\s*>\s+/gm, '')
      // Remove list items: - item -> item
      .replaceAll(/^\s*[-*+]\s+/gm, '')
      .replaceAll(/^\s*\d+\.\s+/gm, '')
      // Normalize spacing
      .replaceAll(/\s+/g, ' ')
      .trim()
  );
}

export class SearchIndexBuilder {
  private documents: SearchDocument[] = [];
  private options: SearchOptions;
  private indexes: SearchIndexes;

  constructor(options: SearchOptions = {}) {
    this.options = {
      include: ['**/*.md', '**/*.mdx'],
      exclude: [],
      searchOptions: { limit: 7, enrich: true, suggest: true },
      ...options,
    };
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
    const lines = content.split('\n');
    if (lines[0]?.trim() !== '---') {
      return { frontmatter: {}, content };
    }

    const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (endIndex === -1) {
      return { frontmatter: {}, content };
    }

    const frontmatter: Record<string, string> = {};
    for (const line of lines.slice(1, endIndex)) {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex <= 0) continue;

      frontmatter[line.slice(0, separatorIndex).trim()] = line
        .slice(separatorIndex + 1)
        .trim()
        .replaceAll(/^['"]|['"]$/g, '');
    }

    return { frontmatter, content: lines.slice(endIndex + 1).join('\n') };
  }

  private extractContent(content: string) {
    const { frontmatter, content: body } = this.extractFrontmatter(content);
    let title = frontmatter.title || 'Untitled';
    const headings: string[] = [];
    const rawHeaders: NonNullable<SearchDocument['rawHeaders']> = [];
    let id = 0;

    for (const line of body.split('\n')) {
      const trimmedLine = line.trimStart();
      const marker = trimmedLine.match(/^#{1,6}/)?.[0];
      if (!marker || trimmedLine[marker.length] !== ' ') continue;

      const depth = marker.length;
      const text = trimmedLine.slice(depth + 1).trim();
      if (!text) continue;

      if (!frontmatter.title && depth === 1 && title === 'Untitled') {
        title = text;
      } else if (depth > 1) {
        headings.push(text);
        rawHeaders.push({ id: `heading-${++id}`, text, depth });
      }
    }

    const cleanContent = stripMarkdown(body);
    return { title, headings, content: cleanContent, rawHeaders };
  }

  addDocument(filePath: string, content: string): void {
    if (!this.shouldIncludeFile(filePath)) return;
    const { title, headings, content: cleanContent, rawHeaders } = this.extractContent(content);
    const doc: SearchDocument = {
      id: this.documents.length + 1,
      path: normalizeDocumentPath(filePath, this.options.defaultLocaleSourcePrefix),
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
    const baseName = path.basename(dir);
    if (['node_modules', '.git', '.temp', 'dist', 'build'].includes(baseName)) {
      return;
    }
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        this.addDocumentsFromDirectory(filePath, baseDir);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const relativePath = path.relative(baseDir, filePath).replaceAll('\\', '/');
        // `addDocument` already applies `shouldIncludeFile`, so don't glob twice.
        try {
          this.addDocument(relativePath, fs.readFileSync(filePath, 'utf-8'));
        } catch {}
      }
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      return await searchDocuments(this.indexes, this.documents, query, {
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
