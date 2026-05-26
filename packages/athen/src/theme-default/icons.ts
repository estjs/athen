import type { IconLink, IconLinkIcon } from '@/shared/types';

type IconLinkSvg = Extract<IconLinkIcon, { svg: string }>;
type IconLinkName = Exclude<IconLinkIcon, IconLinkSvg>;

/**
 * Built-in social-link icons. Maps the public `IconLinkIcon` string union to
 * an unocss-iconify class. Extend by passing `{ svg: '<svg ...>' }` for
 * non-built-in icons.
 */
export const socialIconMap = {
  discord: 'i-carbon-logo-discord',
  facebook: 'i-carbon-logo-facebook',
  gitlab: 'i-carbon-logo-gitlab',
  github: 'i-carbon-logo-github',
  instagram: 'i-carbon-logo-instagram',
  linkedin: 'i-carbon-logo-linkedin',
  mastodon: 'i-carbon-logo-mastodon',
  npm: 'i-carbon-logo-npm',
  slack: 'i-carbon-logo-slack',
  twitter: 'i-carbon-logo-twitter',
  wechat: 'i-carbon-logo-wechat',
  x: 'i-carbon-logo-x',
  youtube: 'i-carbon-logo-youtube',
} satisfies Record<IconLinkName, string>;

export function isSvgIcon(icon: IconLinkIcon): icon is IconLinkSvg {
  return typeof icon === 'object' && 'svg' in icon;
}

export function getIconLinkLabel(item: IconLink) {
  if (item.ariaLabel) return item.ariaLabel;
  return isSvgIcon(item.icon) ? 'external link' : item.icon;
}
