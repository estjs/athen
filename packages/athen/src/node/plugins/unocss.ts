import { presetUno } from 'unocss';
import presetIcons from '@unocss/preset-icons/browser';
import type { VitePluginConfig } from 'unocss/vite';

const options: VitePluginConfig = {
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      },
    }),
  ],
  theme: {
    colors: {
      brandLight: 'var(--at-c-brand-light)',
      brandDark: 'var(--at-c-brand-dark)',
      brand: 'var(--at-c-brand)',
      text: {
        1: 'var(--at-c-text-1)',
        2: 'var(--at-c-text-2)',
        3: 'var(--at-c-text-3)',
        4: 'var(--at-c-text-4)',
      },
      border: {
        default: 'var(--at-c-divider)',
        light: 'var(--at-c-divider-light)',
        dark: 'var(--at-c-divider-dark)',
      },
      gray: {
        light: {
          1: 'var(--at-c-gray-light-1)',
          2: 'var(--at-c-gray-light-2)',
          3: 'var(--at-c-gray-light-3)',
          4: 'var(--at-c-gray-light-4)',
        },
      },
      bg: {
        default: 'var(--at-c-bg)',
        soft: 'var(--at-c-bg-soft)',
        mute: 'var(--at-c-bg-mute)',
      },
    },
  },
};

export default options;
