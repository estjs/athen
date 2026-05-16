import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PRERELEASE_REG = /^\d+\.\d+\.\d+-([a-z0-9-]+)/i;

export function getNpmPublishTag(version) {
  const prerelease = version.match(PRERELEASE_REG);

  return prerelease?.[1] ?? 'latest';
}

export function runNpmPublishTagCli(argv = process.argv, write = console.log) {
  const version = argv[2];

  if (!version) {
    throw new Error('Usage: node scripts/npm-publish-tag.js <version>');
  }

  write(getNpmPublishTag(version));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runNpmPublishTagCli();
}
