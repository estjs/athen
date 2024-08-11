import './style.scss';

import { useLocaleSiteData } from '@theme-default/hooks';
import { usePageData } from '@/runtime';
import { Switch } from '../Switch';
import Search from '../Search';
import Link from '../Link';
import { NavMenuGroup, type NavMenuGroupItem } from './NavMenuGroup';

const NavTranslations = ({ translationMenuData }: { translationMenuData?: NavMenuGroupItem }) => {
  return (
    <div class="menu-item-before menu-item-after flex items-center text-sm font-bold">
      <NavMenuGroup {...translationMenuData!} />
    </div>
  );
};

const NavHeader = () => {
  const localeData = useLocaleSiteData();
  const { siteData } = usePageData();
  const localeLanguages = Object.values(siteData.themeConfig.locales || {});
  const hasMultiLanguage = localeLanguages.length > 1;

  const translationMenuData = hasMultiLanguage
    ? {
        items: localeLanguages.map(item => ({
          text: item.label,
          link: `/${item.lang}`,
        })),
        isTranslation: true,
        activeIndex: localeLanguages.findIndex(item => item.lang === localeData.lang),
      }
    : null;

  return (
    <header class="fixed left-0 top-0 z-10 w-full">
      <div class="nav h-14 flex items-center justify-between border-b b-border-default b-b-solid">
        <div>
          <a
            href={localeData.langRoutePrefix || '/'}
            class="h-full w-full flex items-center text-xl font-semibold hover:opacity-60"
          >
            {localeData.title}
          </a>
        </div>

        <div class="search flex-1 pl-8">
          <Search langRoutePrefix={localeData.langRoutePrefix || ''} />
        </div>

        <div class="flex items-center">
          <div class="flex items-center">
            {(localeData?.nav || []).map(item => (
              <div class="mx-3 text-sm font-medium">
                {item.items ? (
                  <NavMenuGroup {...item} />
                ) : (
                  <Link href={item.link}>{item.text}</Link>
                )}
              </div>
            ))}
          </div>
          {hasMultiLanguage && <NavTranslations translationMenuData={translationMenuData} />}
          <Switch />
          <div class="social-link-icon ml-2">
            <a href="/">
              <div class="i-carbon-logo-github h-5 w-5 fill-current"></div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
