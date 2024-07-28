import { presetIcons, presetWind } from 'unocss';
import type { VitePluginConfig } from 'unocss/vite';

const options: VitePluginConfig = {
  presets: [
    presetWind({}),
    presetIcons({
      customizations: {
        transform(svg) {
          return svg;
        },
      },
    }),
  ],
};

export default options;
