import { transformAsync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import { type Plugin, transformWithEsbuild } from 'vite';
import { MD_REGEX, SX_REGEX } from '../../constants';
export function pluginTransform(isServer): Plugin {
  return {
    name: 'athen:transform',
    apply: 'build',
    async transform(code, id, opts) {
      if (SX_REGEX.test(id) || MD_REGEX.test(id)) {
        const strippedTypes = await transformWithEsbuild(code, id, {
          jsx: 'preserve',
          loader: 'tsx',
        });

        const result = await transformAsync((await strippedTypes).code, {
          filename: id,
          sourceType: 'module',
          plugins: [[BabelPluginEssor, { ...opts, hmr:false, mode: !isServer ? 'ssg' : 'ssr' }]],
        });
        return {
          code: result?.code || code,
          map: result?.map,
        };
      }
    },
  };
}
