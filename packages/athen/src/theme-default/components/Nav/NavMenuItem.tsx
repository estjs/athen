import { computed } from 'essor';
import Link from '../Link';
import { withBase } from '@shared/utils';
import { LOCALE_PREFERENCE_KEY } from '@shared/constants';
import type { DefaultTheme } from '@/shared/types';

export type NavMenuLinkItem = DefaultTheme.NavItemWithLink & {
  getLink?: () => string;
  localePrefix?: string;
};

interface NavMenuItemProps {
  item: NavMenuLinkItem;
  isActive: boolean;
  reload?: boolean;
}

/**
 * 导航菜单项组件
 * @param item 当前菜单项数据
 * @param isActive 是否为当前激活项
 */
const NavMenuItem = ({ item, isActive, reload }: NavMenuItemProps) => {
  const href = computed(() => item.getLink?.() ?? item.link);

  const saveLocalePreference = () => {
    if (item.localePrefix === undefined || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(LOCALE_PREFERENCE_KEY, item.localePrefix);
  };

  const navigateWithReload = (e: MouseEvent) => {
    if (!item.getLink) {
      return;
    }
    e.preventDefault();
    saveLocalePreference();
    window.location.assign(withBase(href.value));
  };

  return isActive ? (
    <div class="rounded-md py-1.6 pl-3">
      <span class="mr-1 text-brand">{item.text}</span>
    </div>
  ) : (
    <div class="font-medium">
      {reload ? (
        <a href={withBase(href.value)} class="at-link cursor-pointer" onClick={navigateWithReload}>
          <div class="rounded-md py-1.6 pl-3 hover:bg-bg-mute">
            <div class="flex items-center">
              <span class="mr-1">{item.text}</span>
              <div class="ml-1 text-text-3">
                <span class="i-carbon-arrow-up-right h-18 w-18" />
              </div>
            </div>
          </div>
        </a>
      ) : (
        <Link href={href.value}>
          <div class="rounded-md py-1.6 pl-3 hover:bg-bg-mute">
            <div class="flex items-center">
              <span class="mr-1">{item.text}</span>
              <div class="ml-1 text-text-3">
                <span class="i-carbon-arrow-up-right h-18 w-18" />
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default NavMenuItem;
