import './style.css';
import { computed } from 'essor';
import { getLocalePath, toggleSidebar, useLocaleSiteData, usePathname } from '@theme-default/hooks';
import { SearchBox } from '@estjs/athen-plugin-search/client';
import { usePageData } from '@/runtime';
import { Switch } from '../Switch';
import Link from '../Link';
import { getIconLinkLabel, isSvgIcon, socialIconMap } from '../../icons';
import NavTranslations from './NavTranslations';
import NavMenuGroup from './NavMenuGroup';
import type {
  IconLink,
  IconLinkIcon,
  LocaleConfig,
  NavItem,
  NavItemWithChildren,
} from '@/shared/types';

function isNavGroup(item: NavItem): item is NavItemWithChildren {
  return 'items' in item;
}

function renderIcon(icon: IconLinkIcon) {
  if (isSvgIcon(icon)) {
    return <span class="nav-icon-link-svg h-5 w-5" innerHTML={icon.svg} />;
  }
  const iconClass = socialIconMap[icon];
  return iconClass ? (
    <span class={`${iconClass} h-5 w-5 fill-current`} />
  ) : (
    <span class="text-sm">{icon}</span>
  );
}

const NavIconLinks = ({ links }: { links?: IconLink[] }) => {
  if (!links?.length) return null;
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
            {renderIcon(item.icon)}
          </a>
        );
      })}
    </div>
  );
};

function createTranslationMenu(
  pathname: string,
  locales: Record<string, LocaleConfig> = {},
  activeLang?: string,
) {
  const entries = Object.entries(locales);
  if (entries.length <= 1) return null;
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
    createTranslationMenu(pathname.value, siteData.locales, localeData.value.lang),
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
        <a
          href={localeData.value.langRoutePrefix || '/'}
          class="h-full flex items-center text-xl font-semibold hover:opacity-60">
          {localeData.value.title}
        </a>

        <div class="search flex-1 pl-4 md:pl-8">
          <SearchBox langRoutePrefix={localeData.value.langRoutePrefix || ''} />
        </div>

        <div class="flex items-center">
          <div class="nav-desktop-links">
            {(localeData.value?.nav || []).map((item) => (
              <div class="mx-3 text-sm font-medium">
                {isNavGroup(item) ? (
                  <NavMenuGroup {...item} />
                ) : (
                  <Link href={item.link}>{item.text}</Link>
                )}
              </div>
            ))}
          </div>

          <div class="hidden sm:block">
            {translationMenuData.value && (
              <NavTranslations translationMenuData={translationMenuData.value} />
            )}
          </div>

          <div class="mx-2 h-24px!">
            <Switch />
          </div>

          <NavIconLinks links={siteData.socialLinks} />

          <button
            type="button"
            class="nav-sidebar-toggle ml-2 cursor-pointer"
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}>
            <span class="i-carbon-menu h-6 w-6"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
