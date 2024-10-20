import NavMenuGroup from './NavMenuGroup';
import type { NavMenuGroupItem } from './NavMenuGroup';

/**
 * 导航栏翻译组件
 * @param translationMenuData 翻译菜单数据
 */
const NavTranslations = (props: { translationMenuData: NavMenuGroupItem }) => {
  return (
    <div class="menu-item-before menu-item-after flex items-center text-sm font-bold">
      <NavMenuGroup {...props.translationMenuData} />
    </div>
  );
};

export default NavTranslations;
