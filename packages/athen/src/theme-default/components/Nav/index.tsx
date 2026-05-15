import './style.scss';
import { computed } from 'essor';
import { getLocalePath, useLocaleSiteData, usePathname } from '@theme-default/hooks';
import { SearchBox } from '@athen/plugin-search/client';
import { usePageData } from '@/runtime';
import { Switch } from '../Switch';
import Link from '../Link';
import NavTranslations from './NavTranslations';
import NavMenuGroup from './NavMenuGroup';
import type { DefaultTheme } from '@/shared/types';

function isNavGroup(item: DefaultTheme.NavItem): item is DefaultTheme.NavItemWithChildren {
  return 'items' in item;
}

type IconLinkSvg = Extract<DefaultTheme.IconLinkIcon, { svg: string }>;
type IconLinkName = Exclude<DefaultTheme.IconLinkIcon, IconLinkSvg>;

const iconLinkIconMap = {
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

function isSvgIcon(icon: DefaultTheme.IconLinkIcon): icon is IconLinkSvg {
  return typeof icon === 'object' && 'svg' in icon;
}

function getIconLinkLabel(item: DefaultTheme.IconLink) {
  if (item.ariaLabel) {
    return item.ariaLabel;
  }

  return isSvgIcon(item.icon) ? 'external link' : item.icon;
}

function renderIconLinkIcon(icon: DefaultTheme.IconLinkIcon) {
  if (isSvgIcon(icon)) {
    return <span class="nav-icon-link-svg h-5 w-5" innerHTML={icon.svg} />;
  }

  const iconClass = iconLinkIconMap[icon];

  return iconClass ? (
    <span class={`${iconClass} h-5 w-5 fill-current`} />
  ) : (
    <span class="text-sm">{icon}</span>
  );
}

const NavIconLinks = ({ links }: { links?: DefaultTheme.IconLink[] }) => {
  if (!links?.length) {
    return null;
  }

  return (
    <div class="hidden items-center sm:flex">
      {links.map((item) => {
        const label = getIconLinkLabel(item);
        return (
          <a
            key={item.link}
            href={item.link}
            class="nav-icon-link ml-3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}>
            {renderIconLinkIcon(item.icon)}
          </a>
        );
      })}
    </div>
  );
};

function createTranslationMenu(
  pathname: string,
  locales: DefaultTheme.Config['locales'] = {},
  activeLang?: string,
) {
  const entries = Object.entries(locales);
  if (entries.length <= 1) {
    return null;
  }

  const prefixes = entries.map(([prefix]) => prefix);

  return {
    items: entries.map(([prefix, config]) => {
      const getLink = () => getLocalePath(pathname, prefix, prefixes);
      return {
        text: config.label,
        link: getLink(),
        getLink,
        localePrefix: prefix,
      };
    }),
    isTranslation: true,
    activeIndex: entries.findIndex(([, config]) => config.lang === activeLang),
  };
}

const NavHeader = () => {
  const localeData = useLocaleSiteData();
  const pathname = usePathname();
  const { siteData } = usePageData();
  const translationMenuData = computed(() =>
    createTranslationMenu(pathname.value, siteData.themeConfig.locales, localeData.value.lang),
  );

  return (
    <header
      class="fixed left-0 top-0 z-[100] w-full"
      style={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'var(--at-c-bg)',
        transition: 'background-color 0.3s',
      }}>
      <div
        class="nav h-[var(--at-nav-height)] flex items-center justify-between border-b b-b-solid"
        style={{ borderBottomColor: 'var(--at-c-divider-light)' }}>
        <div>
          <a
            href={localeData.value.langRoutePrefix || '/'}
            class="h-full w-full flex items-center text-xl font-semibold hover:opacity-60">
            {localeData.value.title}
          </a>
        </div>

        <div class="search flex-1 pl-4 md:pl-8">
          <SearchBox langRoutePrefix={localeData.value.langRoutePrefix || ''} />
        </div>

        <div class="flex items-center">
          {/* Desktop Nav Items */}
          <div class="nav-desktop-links">
            {(localeData.value?.nav || []).map((item) => {
              return (
                <div class="mx-3 text-sm font-medium">
                  {isNavGroup(item) ? (
                    <NavMenuGroup {...item} />
                  ) : (
                    <Link href={item.link}>{item.text}</Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* 如果支持多语言，显示翻译菜单 */}
          <div class="hidden sm:block">
            {translationMenuData.value && (
              <NavTranslations translationMenuData={translationMenuData.value} />
            )}
          </div>

          <div class="mx-2 h-24px!">
            <Switch />
          </div>

          <NavIconLinks links={siteData.themeConfig.links} />

          {/* Mobile Hamburger Menu */}
          <div
            class="nav-sidebar-toggle ml-2 cursor-pointer"
            onClick={() => {
              document.querySelector('.sidebar')?.classList.toggle('open');
              document.querySelector('.sidebar-backdrop')?.classList.toggle('open');
            }}>
            <div class="i-carbon-menu h-6 w-6"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
