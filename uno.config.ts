import { defineConfig } from 'unocss/vite';
import unocssOptions from './packages/athen/src/node/plugins/unocss';

// it's just a code hint for unocss, nothing more.
export default defineConfig({
  ...unocssOptions,
});
