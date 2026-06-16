import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { execa } from 'execa';
import { describe, expect, it } from 'vitest';
import { PACKAGE_NAME_REGEXP, detectPackageManager, toValidPackageName } from '../src/index';

describe('toValidPackageName', () => {
  it('passes through already-valid names', () => {
    expect(toValidPackageName('my-app')).toBe('my-app');
    expect(toValidPackageName('athen')).toBe('athen');
  });

  it('slugifies names with spaces and uppercase', () => {
    expect(toValidPackageName('My App')).toBe('my-app');
    expect(toValidPackageName('  Hello World  ')).toBe('hello-world');
  });

  it('strips leading dots/underscores and collapses invalid chars', () => {
    expect(toValidPackageName('.hidden')).toBe('hidden');
    expect(toValidPackageName('foo@bar!baz')).toBe('foo-bar-baz');
  });

  it('produces output that matches the package-name regexp', () => {
    for (const input of ['My App', 'foo@bar', 'Project 123']) {
      expect(PACKAGE_NAME_REGEXP.test(toValidPackageName(input))).toBe(true);
    }
  });
});

describe('detectPackageManager', () => {
  it('returns one of the supported managers', () => {
    expect(['pnpm', 'yarn', 'npm']).toContain(detectPackageManager());
  });
});

describe('create-athen CLI', () => {
  it('writes a valid package name in --yes mode for display names', async () => {
    const workdir = await mkdtemp(join(tmpdir(), 'create-athen-'));

    try {
      await execa('node', [join(import.meta.dirname, '../dist/index.js'), 'My App', '--yes'], {
        cwd: workdir,
        env: { ...process.env, VITEST: undefined },
      });

      const packageJson = JSON.parse(await readFile(join(workdir, 'My App/package.json'), 'utf-8'));

      expect(packageJson.name).toBe('my-app');
      expect(PACKAGE_NAME_REGEXP.test(packageJson.name)).toBe(true);
    } finally {
      await rm(workdir, { recursive: true, force: true });
    }
  });
});
