import { join } from 'node:path';

export const isProduction = () => process.env.NODE_ENV === 'production';

const __dirname = new URL('.', import.meta.url).pathname;

export const PACKAGE_ROOT = join(__dirname, '..');

export const TS_REGEX = /\.(jsx|tsx)?$/;
export const MD_REGEX = /\.mdx?$/;

export const SERVER_ENTRY_PATH = join(PACKAGE_ROOT, 'src', 'runtime', 'ssr-entry.tsx');
export const CLIENT_ENTRY_PATH = join(PACKAGE_ROOT, 'src', 'runtime', 'client-entry.tsx');
export const DEFAULT_HTML_PATH = join(PACKAGE_ROOT, 'index.html');

export const DEFAULT_EXTERNALS: string[] = ['essor'];

export const CLIENT_RUNTIME_PATH = join(PACKAGE_ROOT, 'src/runtime');

export const SHARED_PATH = join(PACKAGE_ROOT, 'src/shared');
export const CLIENT_EXPORTS_PATH = join(CLIENT_RUNTIME_PATH, 'index.ts');
export const DEFAULT_THEME_PATH = join(PACKAGE_ROOT, 'src/theme-default');
