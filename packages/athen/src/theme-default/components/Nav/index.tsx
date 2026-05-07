import './style.scss';
import { useLocaleSiteData } from '@theme-default/hooks';
import { SearchBox } from '@athen/plugin-search/client';
import { usePageData } from '@/runtime';
import { Switch } from '../Switch';
import Link from '../Link';
import NavTranslations from './NavTranslations';
import NavMenuGroup from './NavMenuGroup';

const NavHeader = () => {
  const localeData = useLocaleSiteData().value;
  const { siteData } = usePageData();
  const localeLanguages = Object.values(siteData.themeConfig.locales || {});
  const hasMultiLanguage = localeLanguages.length > 1;

  // 构建翻译菜单数据
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
    <header class="fixed left-0 top-0 z-[100] w-full" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'var(--at-c-bg)', transition: 'background-color 0.3s' }}>
      <div class="nav h-[var(--at-nav-height)] flex items-center justify-between border-b b-b-solid" style={{ borderBottomColor: 'var(--at-c-divider-light)' }}>
        <div>
          <a
            href={localeData.langRoutePrefix || '/'}
            class="h-full w-full flex items-center text-xl font-semibold hover:opacity-60"
          >
            {localeData.title}
          </a>
        </div>

        <div class="search flex-1 pl-4 md:pl-8">
          <SearchBox langRoutePrefix={localeData.langRoutePrefix || ''} />
        </div>

        <div class="flex items-center">
          {/* Desktop Nav Items */}
          <div class="hidden lg:flex items-center">
            {(localeData?.nav || []).map(item => (
              <div key={item.link} class="mx-3 text-sm font-medium">
                {item.items ? (
                  <NavMenuGroup {...item} />
                ) : (
                  <Link href={item.link}>{item.text}</Link>
                )}
              </div>
            ))}
          </div>
          
          {/* 如果支持多语言，显示翻译菜单 */}
          <div class="hidden sm:block">
            {hasMultiLanguage && <NavTranslations translationMenuData={translationMenuData} />}
          </div>
          
          <div class="mx-2">
            <Switch />
          </div>
          
          <div class="social-link-icon ml-2 hidden sm:block">
            <a href="/">
              <div class="i-carbon-logo-github h-5 w-5 fill-current"></div>
            </a>
          </div>

          {/* Mobile Hamburger Menu */}
          <div class="lg:hidden ml-2 cursor-pointer flex items-center" onClick={() => {
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
