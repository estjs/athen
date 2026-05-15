import { types as babelTypes, transformAsync } from '@babel/core';
import BabelPluginEssor from 'babel-plugin-essor';
import { type Plugin, transformWithOxc } from 'vite';
import { MD_REGEX, SX_REGEX } from '../../constants';

function pluginRewriteServerForImport() {
  return {
    name: 'athen:rewrite-server-for-import',
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value !== 'essor') {
          return;
        }

        const serverSpecifiers = path.node.specifiers.filter((specifier) => {
          return (
            babelTypes.isImportSpecifier(specifier) &&
            babelTypes.isIdentifier(specifier.imported) &&
            specifier.imported.name === 'For'
          );
        });

        if (serverSpecifiers.length === 0) {
          return;
        }

        path.node.specifiers = path.node.specifiers.filter(
          (specifier) => !serverSpecifiers.includes(specifier),
        );
        path.insertAfter(
          babelTypes.importDeclaration(serverSpecifiers, babelTypes.stringLiteral('essor/server')),
        );

        if (path.node.specifiers.length === 0) {
          path.remove();
        }
      },
    },
  };
}

export function pluginTransform(isServer): Plugin {
  return {
    name: 'athen:transform',
    apply: 'build',
    async transform(code, id, opts) {
      if (SX_REGEX.test(id) || MD_REGEX.test(id)) {
        const strippedTypes = await transformWithOxc(code, id, {
          jsx: 'preserve',
          lang: 'tsx',
        });

        const result = await transformAsync(strippedTypes.code, {
          filename: id,
          sourceType: 'module',
          plugins: [
            [BabelPluginEssor, { ...opts, hmr: false, mode: !isServer ? 'server' : 'hydrate' }],
            !isServer && pluginRewriteServerForImport(),
          ].filter(Boolean),
        });
        return {
          code: result?.code || code,
          map: result?.map,
        };
      }
    },
  };
}
