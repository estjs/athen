import copy from 'copy-to-clipboard';

export function setupCopyCodeButton() {
  const timeoutIdMap: Map<HTMLElement, NodeJS.Timeout> = new Map();
  window.addEventListener('click', e => {
    const el = e.target as HTMLElement;

    if (el.matches('div[class*="language-"] > button.copy')) {
      const parent = el.parentElement;
      const sibling = el.nextElementSibling?.nextElementSibling as HTMLPreElement | null;
      if (!parent || !sibling) {
        return;
      }

      const { textContent: text = '' } = sibling;

      const isCopied = copy(text || '');

      if (isCopied) {
        el.classList.add('copied');
        clearTimeout(timeoutIdMap.get(el));
        const timeoutId = setTimeout(() => {
          el.classList.remove('copied');
          el.blur();
          timeoutIdMap.delete(el);
        }, 2000);
        timeoutIdMap.set(el, timeoutId);
      }
    }
  });
}
