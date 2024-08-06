const COLOR_SCHEME_KEY = 'color-schema';

export function toggle() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const classList = document.documentElement.classList;

    const setClassList = (isDark = false) => {
      if (isDark) {
        classList.add('dark');
      } else {
        classList.remove('dark');
      }
    };

    const updateColorScheme = () => {
      const userPreference = localStorage.getItem(COLOR_SCHEME_KEY);
      setClassList(userPreference === 'dark');
    };

    updateColorScheme();
    window.addEventListener('storage', updateColorScheme);

    if (classList && classList.contains('dark')) {
      setClassList(false);
      localStorage.setItem(COLOR_SCHEME_KEY, 'light');
    } else {
      setClassList(true);
      localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
    }
  }
}
