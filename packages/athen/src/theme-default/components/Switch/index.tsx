import { useSignal } from 'essor';
import { toggle } from './toggleAppearance';
export function Switch() {
  const isDark = useSignal(false);

  const handleClick = () => {
    toggle();
    isDark.value = !isDark.value;
  };

  return (
    <button
      class="switch relative h-6 w-10 rounded-full bg-gray-300 dark:bg-#000"
      type="button"
      role="switch"
      aria-checked={isDark.value}
      onClick={handleClick}
    >
      <span
        class={`check absolute top-1 left-1 w-4 h-4 bg-white dark:bg-#ccc dark:translate-x-4 rounded-full transition-transform transform }`}
      ></span>
    </button>
  );
}
