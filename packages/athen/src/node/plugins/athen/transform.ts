import { transformAsync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import { MD_REGEX, TS_REGEX } from '../../constants';
import type { Plugin } from 'vite';
export function pluginTransform(): Plugin {
  return {
    name: 'athen:vite-plugin-internal',
    apply: 'build',
    async transform(code, id, opts) {
      if (TS_REGEX.test(id) || MD_REGEX.test(id)) {
        const result = await transformAsync(code, {
          filename: `${id}`,
          sourceType: 'module',
          plugins: [[BabelPluginEssor, { ...opts, ssg: true }]],
        });
        return {
          code: result?.code || code,
          map: result?.map,
        };
      }
    },
  };
}
