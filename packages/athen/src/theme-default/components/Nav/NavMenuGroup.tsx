import { useSignal } from 'essor';
import Down from '../../assets/down.svg';
import Link from '../Link/index';
import Right from '../../assets/right.svg';
import Translator from '../../assets/translator.svg';
import type { DefaultTheme } from '@/shared/types';

export interface NavMenuGroupItem {
  text?: string | JSX.Element;
  items: DefaultTheme.NavItemWithLink[];
  activeIndex?: number;
  isTranslation?: boolean;
}

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
        {isTranslation ? <Translator height="18" width="18"></Translator> : text}
        <Down height="18" width="18" />
      </button>
      <div
        class="absolute left-[-60px] top-14 mx-0.8 transition-opacity duration-300"
        style={{
          opacity: isOpen.value ? 1 : 0,
          visibility: isOpen.value ? 'visible' : 'hidden',
        }}
      >
        <div class="z-100 mr-[1.5rem] h-full max-h-100vh min-w-100px w-full overflow-y-auto b-1 b-border-default rounded-xl b-solid bg-bg-default p-3 shadow-[var(--at-shadow-3)]">
          {items.map((child, index) => {
            if (index === activeIndex) {
              return (
                <div key={child.link} class="rounded-md py-1.6 pl-3">
                  <span class="mr-1 text-brand">{child.text}</span>
                </div>
              );
            } else {
              return (
                <div key={child.link} class="font-medium">
                  <Link href={child.link} link={true}>
                    <div class="rounded-md py-1.6 pl-3 hover:bg-bg-mute">
                      <div class="flex items-center">
                        <span class="mr-1">{child.text}</span>
                        <div class="ml-1 text-text-3">
                          <Right height="18" width="18" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
