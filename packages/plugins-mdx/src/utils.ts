import process from 'node:process';
import { createHash as createHashFunc } from 'node:crypto';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const DIRECTIVE_TYPES: string[] = ['tip', 'warning', 'danger', 'info'];
export const MD_REGEX = /\.mdx?$/;

export const queryRE = /\?.*$/s;
export const hashRE = /#.*$/s;

export const cleanUrl = (url: string): string => url.replace(hashRE, '').replace(queryRE, '');

export const TARGET_BLANK_WHITE_LIST = [
  'https://essor.netlify.app/',
  'https://essor-playground.netlify.app/',
  'https://essor-router.netlify.app/',
];

export const LANGS = [
  'javascript',
  'vue',
  'typescript',
  'html',
  'css',
  'sass',
  'less',
  'stylus',
  'scss',
  'jsonc',
  'yaml',
  'html',
  'json',
  'jsonc',
  'markdown',
  'mdx',
  'shell',
  'bash',
  'sql',
  'python',
  'java',
  'c',
  'c++',
  'c#',
  'go',
  'kotlin',
  'php',
  'swift',
  'rust',
];

export const dynamicImport = new Function('modulePath', 'return import(modulePath)');

export const createHash = (info: string): string => {
  if (!info) {
    throw new Error(`Invalid info: ${info}`);
  }
  return createHashFunc('sha256').update(info).digest('hex').slice(0, 8);
};

export const parseUrl = (
  url: string,
): {
  url: string;
  query: string;
  hash: string;
} => {
  const [withoutHash, hash = ''] = url.split('#');
  const [cleanedUrl, query = ''] = withoutHash.split('?');
  return {
    url: cleanedUrl,
    query,
    hash,
  };
};

export const defaultConfig = {
  essor: true,
  root: '/',
  base: '/',
};
