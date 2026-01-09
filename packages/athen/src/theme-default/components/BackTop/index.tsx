import { Fragment, onDestroy, onMount, signal } from 'essor';
import BTween from 'b-tween';
import { throttle } from 'lodash-es';

export function BackTop() {
  const visibleHeight = 200;
  const duration = 500;
  const animation = 'quadIn';
  let scrollHandler;

  const scrollToTop = () => {
    const target = document.documentElement;
    const targetScrollTop = target.scrollTop;
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
        return;
      },
    });
    btween.start();
  };

  const visible = signal(false);

  onMount(() => {
    scrollHandler = throttle(() => {
      const scrollTop = document.documentElement.scrollTop;
      visible.value = scrollTop >= visibleHeight;
    }, 500);
    visible.value = false;
    document.addEventListener('scroll', scrollHandler);
  });

  onDestroy(() => {
    scrollHandler.cancel();
    document.removeEventListener('scroll', scrollHandler);
  });

  return (
    <Fragment>
      {visible.value ? (
        <div class="fixed bottom-10 right-20 z-10 hidden md:block" onClick={scrollToTop}>
          <button
            class="h-10 w-10 b-1 b-#eee rounded-full b-solid bg-gray-200 text-gray shadow-md duration-300 hover:bg-gray-300 hover:text-gray-500 hover:shadow-lg"
            style={{ 'background-color': 'var(--at-c-bg)' }}
          >
            <div class="flex items-center justify-center">
              <div class="i-carbon-chevron-up text-xl"></div>
            </div>
          </button>
        </div>
      ) : undefined}
    </Fragment>
  );
}
