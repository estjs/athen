import { tmpdir } from 'node:os';
import { join, resolve as pathResolve } from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { describe, expect, it } from 'vitest';
import { resolveConfig } from '../src/node/config';
import { DEFAULT_THEME_PATH } from '../src/node/constants';

function createTempProject(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'athen-theme-test-'));
  // write files
  for (const [relative, content] of Object.entries(files)) {
    const filePath = join(dir, relative);
    mkdirSync(pathResolve(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
  }
  return dir;
}

describe('theme resolution in config', () => {
  it('uses default theme when none specified', async () => {
    const root = createTempProject({
      'athen.config.js': `module.exports = {};`,
    });

    const config = await resolveConfig(root, 'serve', 'development');
    expect(config.themeDir).toBe(DEFAULT_THEME_PATH);

    rmSync(root, { recursive: true, force: true });
  });

  it('resolves theme path relative to project root', async () => {
    const root = createTempProject({
      'athen.config.js': `module.exports = { theme: 'my-theme' };`,
    });
    // create dummy theme dir
    mkdirSync(join(root, 'my-theme'), { recursive: true });

    const config = await resolveConfig(root, 'serve', 'development');
    expect(config.themeDir).toBe(pathResolve(root, 'my-theme'));

    rmSync(root, { recursive: true, force: true });
  });
});
