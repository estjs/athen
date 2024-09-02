import { transformSync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import fs from 'fs-extra';
import type { Plugin } from 'vite';
interface SvgrOptions {
  defaultExport?: 'url' | 'component';
}

export function pluginSvgr(options: SvgrOptions = {}): Plugin {
  const { defaultExport = 'component' } = options;

  return {
    name: 'athen:vite-plugin-svgr',
    async transform(code, id) {
      if (!id.endsWith('.svg')) {
        return code;
      }
      const svgrTransform = await (await import('@svgr/core')).transform;
      const svg = await fs.promises.readFile(id, 'utf8');
      const svgrResult = await svgrTransform(
        svg,
        {
          jsxRuntime: 'automatic',
        },
        { componentName: 'EssorComponent' },
      );
      let componentCode = svgrResult;
      if (defaultExport === 'url') {
        componentCode = svgrResult.replace(
          'export default EssorComponent',
          'export { EssorComponent }',
        );
      }
      const result = transformSync(componentCode, {
        filename: `${id}`,
        sourceType: 'module',
        plugins: [[BabelPluginEssor]],
      });
      return {
        code: result?.code,
        map: result?.map,
      };
    },
  };
}
