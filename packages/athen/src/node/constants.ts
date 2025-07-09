import { fileURLToPath } from 'node:url';
import process from 'node:process';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const TS_REGEX = /(c|m)?tsx?$/;
export const SX_REGEX = /(j|t)sx$/;
export const MD_REGEX = /\.mdx?$/;

const root = '..';
const resolvePath = relativePath =>
  fileURLToPath(new URL(`${root}/${relativePath}`, import.meta.url));

//  paths
export const PACKAGE_ROOT = resolvePath('');
export const SERVER_ENTRY_PATH = resolvePath('src/runtime/ssg-entry.tsx');
export const CLIENT_ENTRY_PATH = resolvePath('src/runtime/client-entry.tsx');
export const DEFAULT_HTML_PATH = resolvePath('index.html');
export const CLIENT_RUNTIME_PATH = resolvePath('src/runtime');
export const SHARED_PATH = resolvePath('src/shared');
export const CLIENT_EXPORTS_PATH = resolvePath('src/runtime/index.ts');
export const DEFAULT_THEME_PATH = resolvePath('src/theme-default');

export const DEFAULT_EXTERNALS = ['essor'];

export const DIST_DIR = 'dist';
