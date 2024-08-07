import './style.scss';

import { useLocaleSiteData } from '@theme-default/hooks';
import { usePageData } from '@/runtime';
import { Switch } from '../Switch';
import Search from '../Search';
import { NavMenuGroup, type NavMenuGroupItem } from './NavMenuGroup';

const NavTranslations = ({ translationMenuData }: { translationMenuData?: NavMenuGroupItem }) => {
  return (
    <div className="translation before:menu-item-before flex items-center text-sm font-bold">
      <div m="x-1.5">
        <NavMenuGroup {...translationMenuData!} />
      </div>
    </div>
  );
};

const NavHeader = () => {
  const localeData = useLocaleSiteData();
  const { siteData, pageType } = usePageData();
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

        <div class="flex items-center gap-8px">
          <div class="flex items-center">
            {(localeData?.nav || []).map(item => (
              <div class="mx-3 text-sm font-medium">
                <a href={item.link} class="link">
                  {item.text}
                </a>
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
