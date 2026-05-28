import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { dirname } from 'node:path';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const SX_REGEX = /(j|t)sx$/;
export const MD_REGEX = /\.mdx?$/;

const currentDir = dirname(fileURLToPath(import.meta.url));
const root =
  currentDir.endsWith('/src/node') || currentDir.endsWith('\\src\\node') ? '../..' : '..';
const resolvePath = (relativePath: string) =>
  fileURLToPath(new URL(`${root}/${relativePath}`, import.meta.url));

//  paths
export const PACKAGE_ROOT = resolvePath('');
export const SSG_ENTRY_PATH = resolvePath('src/runtime/ssgEntry.tsx');
export const SSR_ENTRY_PATH = resolvePath('src/runtime/ssrEntry.tsx');
export const CLIENT_ENTRY_PATH = resolvePath('src/runtime/clientEntry.tsx');
export const SHARED_PATH = resolvePath('src/shared');
export const CLIENT_EXPORTS_PATH = resolvePath('src/runtime/index.ts');
export const DEFAULT_THEME_PATH = resolvePath('src/theme-default');

export const DEFAULT_EXTERNALS = ['essor'];

export const DEFAULT_OUT_DIR = 'dist';
export const DEFAULT_TEMP_DIR = '.temp';

/** Resolve the output directory for a build, honoring `config.outDir`. */
export function resolveOutDir(config: { outDir?: string }): string {
  return config.outDir || DEFAULT_OUT_DIR;
}

/** Resolve the temp directory for a build, honoring `config.tempDir`. */
export function resolveTempDir(config: { tempDir?: string }): string {
  return config.tempDir || DEFAULT_TEMP_DIR;
}
