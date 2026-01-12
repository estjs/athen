import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import FlexSearch from 'flexsearch';
import type { SearchDocument, SearchOptions, SearchResult } from './types';

const CJK_REGEX =
  /[\u3131-\u314E|\u314F-\u3163\uAC00-\uD7A3\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\u3041-\u3096\u30A1-\u30FA]|[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]/gu;

function globMatch(pattern: string, str: string): boolean {
  if (pattern === str) return true;
  if (pattern === '**/*.md') return str.endsWith('.md');
  if (pattern === '**/*.mdx') return str.endsWith('.mdx');
  if (pattern.includes('**/') && pattern.includes('/**')) {
    const middle = pattern.replace(/^\*\*\//, '').replace(/\/\*\*$/, '');
    return str.includes(`${middle}/`);
  }
  const regexPattern = pattern
    .replaceAll('.', '\\.')
    .replaceAll('**', '.*')
    .replaceAll('*', '[^/]*')
    .replaceAll('?', '.');
  return new RegExp(`^${regexPattern}$`).test(str);
}

export class SearchIndexBuilder {
  private documents: SearchDocument[] = [];
  private options: SearchOptions;
  private md: MarkdownIt;
  private index: any;
  private cjkIndex: any;

  constructor(options: SearchOptions = {}) {
    this.options = {
      include: ['**/*.md', '**/*.mdx'],
      exclude: [],
      searchOptions: { limit: 7, enrich: true, suggest: true },
      ...options,
    };
    this.md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    this.initializeIndexes();
  }

  private initializeIndexes() {
    const opts: any = {
      preset: 'score',
      tokenize: 'forward',
      resolution: 9,
      document: {
        id: 'id',
        field: ['title', 'headings', 'content'],
        store: ['path', 'title', 'headings', 'rawHeaders'],
      },
    };
    this.index = new FlexSearch.Document(opts);
    this.cjkIndex = new FlexSearch.Document({
      ...opts,
      encode: false as any,
      tokenize: ((str: string) => {
        const words: string[] = [];
        let m: RegExpExecArray | null;
        CJK_REGEX.lastIndex = 0;
        while ((m = CJK_REGEX.exec(str))) words.push(m[0]);
        return words;
      }) as any,
    });
  }

  private shouldIncludeFile(filePath: string): boolean {
    const normalizedPath = filePath.replaceAll('\\', '/');
    for (const pattern of this.options.exclude || []) {
      if (globMatch(pattern, normalizedPath)) return false;
    }
    for (const pattern of this.options.include || []) {
      if (globMatch(pattern, normalizedPath)) return true;
    }
    return false;
  }

  private extractFrontmatter(content: string): { frontmatter: any; content: string } {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (match) {
      const frontmatter: any = {};
      match[1].split('\n').forEach(line => {
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
    const rawHeaders: any[] = [];
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
    // Normalize path: convert backslashes to forward slashes, remove extension, handle index files
    let normalizedPath = filePath.replaceAll('\\', '/').replace(/\.(md|mdx)$/, '');
    // Handle index files - convert /index to /
    normalizedPath = normalizedPath.replace(/\/index$/, '/');
    // Ensure path starts with /
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`;
    }
    const doc: SearchDocument = {
      id: this.documents.length + 1,
      path: normalizedPath,
      title,
      headings,
      content: cleanContent,
      rawHeaders,
    };
    this.documents.push(doc);
    this.index.add(doc);
    this.cjkIndex.add(doc);
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
    if (!query.trim()) return [];
    const limit = this.options.searchOptions?.limit || 7;
    try {
      const [eng, cjk] = await Promise.all([
        this.index.search(query, { limit }),
        this.cjkIndex.search(query, { limit }),
      ]);
      const normalize = (r: any) =>
        Array.isArray(r) ? r.flatMap(x => (Array.isArray(x?.result) ? x.result : x)) : [];
      const unique = new Map<number, SearchDocument>();
      [...normalize(eng), ...normalize(cjk)].forEach((id: any) => {
        const doc = this.documents.find(d => d.id === id);
        if (doc) unique.set(doc.id, doc);
      });
      return Array.from(unique.values())
        .slice(0, limit)
        .map(doc => {
          let content = '',
            heading = '';
          if (doc.content) {
            const idx = doc.content.toLowerCase().indexOf(query.toLowerCase());
            if (idx !== -1) {
              const s = Math.max(0, idx - 40),
                e = Math.min(doc.content.length, idx + query.length + 40);
              content =
                (s > 0 ? '...' : '') +
                doc.content.slice(s, e) +
                (e < doc.content.length ? '...' : '');
            }
          }
          if (doc.headings) {
            const m = doc.headings.find(h => h.toLowerCase().includes(query.toLowerCase()));
            if (m) heading = m;
          }
          return { path: doc.path, title: doc.title, heading, content };
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
