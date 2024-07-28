const APPEARANCE_KEY = 'color-schema';

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

    const updateAppearance = () => {
      const userPreference = localStorage.getItem(APPEARANCE_KEY);
      setClassList(userPreference === 'dark');
    };

    updateAppearance();
    window.addEventListener('storage', updateAppearance);

    if (classList && classList.contains('dark')) {
      setClassList(false);
      localStorage.setItem(APPEARANCE_KEY, 'light');
    } else {
      setClassList(true);
      localStorage.setItem(APPEARANCE_KEY, 'dark');
    }
  }
}
