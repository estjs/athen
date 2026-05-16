import type { Plugin } from 'vite';

interface ExamplePluginOptions {
  message: string;
  htmlMessage: string;
}

const virtualModuleId = 'virtual:athen-example-plugin';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

export function examplePlugin(options: ExamplePluginOptions): Plugin {
  return {
    name: 'athen-example-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify({ message: options.message })}`;
      }
    },
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            name: 'athen-example-plugin',
            content: 'enabled',
          },
          injectTo: 'head',
        },
        {
          tag: 'script',
          children: `window.__ATHEN_EXAMPLE_PLUGIN__=${JSON.stringify(options.htmlMessage)};`,
          injectTo: 'head',
        },
      ];
    },
  };
}
