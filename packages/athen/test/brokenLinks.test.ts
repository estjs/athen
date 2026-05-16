import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkBrokenLinks } from '../src/node/brokenLinks';
import { collectRouteMeta } from '../src/node/plugins/router/routeService';

let root = '';

const writeProject = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'athen-links-'));
  for (const [file, content] of Object.entries(files)) {
    const filePath = join(root, file);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content);
  }
  return root;
};

describe('broken link checker', () => {
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('passes existing local links and anchors', async () => {
    root = writeProject({
      'index.md': '[Guide](./guide.md#install)',
      'guide.md': '# Guide\n\n## Install',
    });

    const result = await checkBrokenLinks({
      routes: collectRouteMeta(root),
      onBrokenLinks: 'throw',
    });

    expect(result.errors).toHaveLength(0);
  });

  it('throws for missing local pages', async () => {
    root = writeProject({
      'index.md': '[Missing](./missing.md)',
    });

    await expect(
      checkBrokenLinks({
        routes: collectRouteMeta(root),
        onBrokenLinks: 'throw',
      }),
    ).rejects.toThrow('Broken link found');
  });

  it('throws for missing anchors on existing pages', async () => {
    root = writeProject({
      'index.md': '[Guide](./guide.md#missing)',
      'guide.md': '# Guide\n\n## Install',
    });

    await expect(
      checkBrokenLinks({
        routes: collectRouteMeta(root),
        onBrokenLinks: 'throw',
      }),
    ).rejects.toThrow('Broken anchor found');
  });

  it('skips external and special protocol links', async () => {
    root = writeProject({
      'index.md': [
        '[GitHub](https://github.com/estjs/athen)',
        '[Email](mailto:test@example.com)',
        '[Phone](tel:123)',
      ].join('\n'),
    });

    const result = await checkBrokenLinks({
      routes: collectRouteMeta(root),
      onBrokenLinks: 'throw',
    });

    expect(result.errors).toHaveLength(0);
  });

  it('warns without throwing when configured to warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    root = writeProject({
      'index.md': '[Missing](./missing.md)',
    });

    const result = await checkBrokenLinks({
      routes: collectRouteMeta(root),
      onBrokenLinks: 'warn',
    });

    expect(result.warnings).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Broken link found'));
  });
});
