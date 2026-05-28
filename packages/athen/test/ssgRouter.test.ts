import { describe, expect, it, vi } from 'vitest';
import { preloadSsgRoute } from '../src/runtime/ssgRouter';

describe('preloadSsgRoute', () => {
  it('resolves async route modules without invoking resolved component functions', async () => {
    const layout = vi.fn(() => '<layout />');
    const page = vi.fn(() => '<page />');
    const router = {
      preloadRoute: vi.fn(async () => {}),
      currentRoute: {
        value: {
          matched: [
            { components: { default: Promise.resolve({ default: layout }) } },
            { components: { default: Promise.resolve({ default: page }) } },
          ],
        },
      },
    };

    await preloadSsgRoute(router, '/guide/');

    expect(router.preloadRoute).toHaveBeenCalledWith('/guide/');
    expect(router.currentRoute.value.matched[0].components.default).toBe(layout);
    expect(router.currentRoute.value.matched[1].components.default).toBe(page);
    expect(layout).not.toHaveBeenCalled();
    expect(page).not.toHaveBeenCalled();
  });
});
