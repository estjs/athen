import { useSignal } from 'essor';
import NavMenuItem from './NavMenuItem';
import type { DefaultTheme } from '@/shared/types';

export interface NavMenuGroupItem {
  text?: string | JSX.Element;
  items: DefaultTheme.NavItemWithLink[];
  activeIndex?: number;
  isTranslation?: boolean;
}

export interface NavMenuGroupItem {
  text?: string | JSX.Element;
  items: DefaultTheme.NavItemWithLink[];
  activeIndex?: number;
  isTranslation?: boolean;
}

/**
 * 导航菜单组组件
 * @param activeIndex 当前激活的菜单项索引
 * @param isTranslation 是否为翻译菜单
 * @param items 菜单项数组
 * @param text 菜单组显示的文本
 */
export function NavMenuGroup({ activeIndex, isTranslation, items, text }: NavMenuGroupItem) {
  const isOpen = useSignal(false);

  return (
    <div
      class="relative h-60px flex items-center"
      onMouseLeave={() => {
        isOpen.value = false;
      }}
    >
      <button
        onMouseEnter={() => {
          isOpen.value = true;
        }}
        class="flex items-center gap-4px b-x-2 text-1 text-sm font-medium transition-color duration-200 hover:text-text-2"
      >
        {isTranslation ? <span class="i-carbon-translate" height="18" width="18" /> : text}
        <span class="i-carbon-chevron-down" height="18" width="18" />
      </button>
      <div
        class="absolute left-[-60px] top-14 mx-0.8 transition-opacity duration-300"
        style={{
          opacity: isOpen.value ? 1 : 0,
          visibility: isOpen.value ? 'visible' : 'hidden',
        }}
      >
        <div class="z-100 mr-[1.5rem] h-full max-h-100vh min-w-100px w-full overflow-y-auto b-1 b-border-default rounded-xl b-solid bg-bg-default p-3 shadow-[var(--at-shadow-3)]">
          {items.map((child, index) => (
            <NavMenuItem item={child} isActive={index === activeIndex} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavMenuGroup;
