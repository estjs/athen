import { onDestroy, onMount, signal } from 'essor';
import BTween from 'b-tween';
import { throttle } from 'lodash-es';
import { getBackTopScrollTarget, getPageScrollTop, isBackTopVisible } from './utils';

export function BackTop() {
  const visibleHeight = 200;
  const duration = 500;
  const animation = 'quadIn';
  let scrollHandler: ReturnType<typeof throttle> | undefined;

  const scrollToTop = () => {
    const target = getBackTopScrollTarget();
    const targetScrollTop = getPageScrollTop();
    const btween = new BTween({
      from: {
        scrollTop: targetScrollTop,
      },
      to: {
        scrollTop: 0,
      },
      easing: animation,
      duration,
      onUpdate: (info?: Record<string, string | number>) => {
        target.scrollTop = Number(info?.scrollTop);
      },
    });
    btween.start();
  };

  const visible = signal(false);

  onMount(() => {
    scrollHandler = throttle(() => {
      visible.value = isBackTopVisible(getPageScrollTop(), visibleHeight);
    }, 100);
    scrollHandler();
    window.addEventListener('scroll', scrollHandler, { passive: true });
  });

  onDestroy(() => {
    if (!scrollHandler) return;
    scrollHandler.cancel();
    window.removeEventListener('scroll', scrollHandler);
  });

  return (
    <div
      class="fixed bottom-6 right-4 z-40 transition-opacity duration-200 md:bottom-10 md:right-20"
      style={{
        'opacity': visible.value ? 1 : 0,
        'visibility': visible.value ? 'visible' : 'hidden',
        'pointer-events': visible.value ? 'auto' : 'none',
      }}
      aria-hidden={!visible.value}
      onClick={scrollToTop}>
      <button
        class="h-10 w-10 b-1 b-#eee rounded-full b-solid bg-gray-200 text-gray shadow-md duration-300 hover:bg-gray-300 hover:text-gray-500 hover:shadow-lg"
        style={{ 'background-color': 'var(--at-c-bg)' }}
        aria-label="Back to top"
        tabIndex={visible.value ? 0 : -1}>
        <div class="flex items-center justify-center">
          <div class="i-carbon-chevron-up text-xl"></div>
        </div>
      </button>
    </div>
  );
}
