import { MD_CONTENT_REGEX, cleanUrl } from './utils';
import type { Plugin } from 'vite';

export function pluginMdxEssor(): Plugin {
  return <Plugin>{
    name: 'vite-plugin-mdx-essor',
    transform(code, id) {
      id = cleanUrl(id);
      if (!MD_CONTENT_REGEX.test(id)) return;

      code = code.replaceAll('<_components.', '<').replaceAll('</_components.', '</');
      return { code, moduleType: 'js' };
    },
  };
}
