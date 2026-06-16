import NavMenuGroup from './NavMenuGroup';
import type { NavMenuGroupItem } from './NavMenuGroup';

/**
 * 导航栏翻译组件。将翻译菜单数据渲染为下拉菜单组。
 */
const NavTranslations = (props: { translationMenuData: NavMenuGroupItem }) => {
  return (
    <div class="menu-item-before menu-item-after flex items-center text-sm font-bold">
      <NavMenuGroup {...props.translationMenuData} />
    </div>
  );
};

export default NavTranslations;
