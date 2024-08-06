import type { DefaultTheme } from '@shared/types';
export function HomeFooter({ footer }: { footer?: DefaultTheme.Footer }) {
  return (
    <footer class="b-1 b-border-default b-t-solid text-center text-14px text-text-2 font-500">
      <p>{footer?.message}</p>
      <p>{footer?.copyright}</p>
    </footer>
  );
}
