import Right from '../../assets/right.svg';
import Link from '../Link';
import type { DefaultTheme } from '@/shared/types';

interface NavMenuItemProps {
  item: DefaultTheme.NavItemWithLink;
  isActive: boolean;
}

/**
 * 导航菜单项组件
 * @param item 当前菜单项数据
 * @param isActive 是否为当前激活项
 */
const NavMenuItem = ({ item, isActive }: NavMenuItemProps) => {
  return isActive ? (
    <div class="rounded-md py-1.6 pl-3">
      <span class="mr-1 text-brand">{item.text}</span>
    </div>
  ) : (
    <div class="font-medium">
      <Link href={item.link} link={true}>
        <div class="rounded-md py-1.6 pl-3 hover:bg-bg-mute">
          <div class="flex items-center">
            <span class="mr-1">{item.text}</span>
            <div class="ml-1 text-text-3">
              <Right height="18" width="18" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NavMenuItem;
