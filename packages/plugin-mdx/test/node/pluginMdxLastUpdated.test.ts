import { describe, expect, it, vi } from 'vitest';

const log = vi.hoisted(() => vi.fn());

vi.mock('simple-git', () => ({
  simpleGit: () => ({ log }),
}));

import { pluginMdxGit } from '../../src/pluginMdxLastUpdated';

describe('pluginMdxGit', () => {
  it('appends a formatted lastUpdatedTime export for markdown sources', async () => {
    log.mockResolvedValueOnce({ latest: { date: '2024-03-04T12:30:00Z' } });
    const plugin = pluginMdxGit();

    const result = await (plugin.transform as any).call({}, 'export const a = 1;', '/docs/guide.md');

    expect(result?.moduleType).toBe('js');
    expect(result?.code).toContain('export const lastUpdatedTime');
    expect(result?.code).toMatch(/2024/);
  });

  it('emits an empty lastUpdatedTime when git log returns nothing', async () => {
    log.mockResolvedValueOnce({ latest: null });
    const plugin = pluginMdxGit();

    const result = await (plugin.transform as any).call({}, '', '/docs/empty.md');

    expect(result?.code).toContain('export const lastUpdatedTime = ""');
  });

  it('emits an empty lastUpdatedTime when git throws', async () => {
    log.mockRejectedValueOnce(new Error('not a git repo'));
    const plugin = pluginMdxGit();

    const result = await (plugin.transform as any).call({}, '', '/docs/foo.md');

    expect(result?.code).toContain('export const lastUpdatedTime = ""');
  });

  it('skips non-markdown files', async () => {
    const plugin = pluginMdxGit();
    const result = await (plugin.transform as any).call({}, '', '/docs/foo.ts');
    expect(result).toBeUndefined();
  });
});
