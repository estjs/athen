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

export const isReg = (val: unknown): val is RegExp => {
  return val instanceof RegExp;
};

export const appendNamedExport = (code: string, name: string, value: unknown) => {
  return `${code}\nexport const ${name} = ${JSON.stringify(value)}\n`;
};
