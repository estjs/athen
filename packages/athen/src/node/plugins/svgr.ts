import { transformSync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import fs from 'fs-extra';
import type { Plugin } from 'vite';
interface SvgrOptions {
  defaultExport?: 'url' | 'component';
}

export function pluginSvgr(options: SvgrOptions = {}, isServer: boolean): Plugin {
  const { defaultExport = 'component' } = options;

  return {
    name: 'athen:vite-plugin-svgr',
    async transform(code, id) {
      const cleanId = id.split('?')[0].split('#')[0];
      if (!cleanId.endsWith('.svg')) {
        return;
      }
      const { transform: svgrTransform } = await import('@svgr/core');
      const svg = await fs.promises.readFile(cleanId, 'utf8');
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
        plugins: [[BabelPluginEssor, { mode: isServer ? 'hydrate' : 'server' }]],
      });
      return {
        code: result?.code ?? code,
        map: result?.map ?? undefined,
        moduleType: 'js',
      };
    },
  };
}
