import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pluginMdxRawContent } from '../../src/pluginMdxRawContent';

describe('pluginMdxRawContent', () => {
  let workdir = '';

  beforeEach(async () => {
    workdir = await mkdtemp(join(tmpdir(), 'athen-mdx-raw-'));
  });

  afterEach(async () => {
    await rm(workdir, { recursive: true, force: true });
  });

  it('appends the original markdown source as `content` export', async () => {
    const file = join(workdir, 'guide.md');
    await writeFile(file, '# Hello\n\nA paragraph.\n', 'utf8');

    const plugin = pluginMdxRawContent();
    const result = await (plugin.transform as any).call({}, 'export const x = 1;', file);

    expect(result.moduleType).toBe('js');
    expect(result.code).toContain('export const x = 1;');
    expect(result.code).toContain('export const content =');
    expect(result.code).toMatch(/Hello/);
    expect(result.code).toMatch(/A paragraph\./);
  });

  it('skips non-markdown files', async () => {
    const plugin = pluginMdxRawContent();
    const result = await (plugin.transform as any).call({}, 'export const x = 1;', '/foo/bar.ts');

    expect(result).toBeUndefined();
  });
});
