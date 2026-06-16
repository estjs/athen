const COLOR_SCHEME_KEY = 'color-schema';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function setDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

/** Apply the persisted color scheme to the `<html>` element. */
export function applyColorScheme() {
  if (!isBrowser()) return;
  setDarkClass(localStorage.getItem(COLOR_SCHEME_KEY) === 'dark');
}

/**
 * Subscribe to cross-tab `storage` changes so the scheme stays in sync.
 * Returns a disposer; register once (e.g. in `onMount`) and call it in
 * `onDestroy` — registering per click would leak a listener on every toggle.
 */
export function watchColorScheme(): () => void {
  if (!isBrowser()) return () => {};
  applyColorScheme();
  window.addEventListener('storage', applyColorScheme);
  return () => window.removeEventListener('storage', applyColorScheme);
}

/** Flip the current scheme and persist the choice. Returns whether dark is active. */
export function toggle(): boolean {
  if (!isBrowser()) return false;
  const nextDark = !document.documentElement.classList.contains('dark');
  setDarkClass(nextDark);
  localStorage.setItem(COLOR_SCHEME_KEY, nextDark ? 'dark' : 'light');
  return nextDark;
}
