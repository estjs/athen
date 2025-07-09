import { describe, expect, it } from 'vitest';
import { SearchIndexBuilder } from '../src/index-builder';

describe('searchIndexBuilder with FlexSearch 0.8', () => {
  it('should index documents and return search results', () => {
    const builder = new SearchIndexBuilder();

    // Add two markdown documents
    builder.addDocument(
      'guide/getting-started.md',
      '# Getting Started\n\nThis is a quick start guide.',
    );
    builder.addDocument('guide/advanced.md', '# Advanced Usage\n\nDeep dive into details.');

    const results = builder.search('quick');

    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Getting Started');
  });

  it('should respect include/exclude patterns', () => {
    const builder = new SearchIndexBuilder({
      include: ['**/guide/**'],
      exclude: ['**/exclude/**'],
    });

    builder.addDocument('guide/intro.md', '# Intro\n\nWelcome');
    builder.addDocument('blog/post.md', '# Blog Post\n\nShould be excluded');

    const results = builder.search('Welcome');

    expect(results.length).toBe(1);
    expect(results[0].path).toBe('guide/intro');
  });
});
