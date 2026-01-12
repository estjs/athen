export interface Header {
  id: string;
  text: string;
  depth: number;
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 200): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T & { cancel: () => void };
  debounced.cancel = () => { if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; } };
  return debounced;
}

export function backTrackHeaders(rawHeaders: Header[], index: number): Header[] {
  if (!rawHeaders?.length || index < 0 || index >= rawHeaders.length) return [];
  let current = rawHeaders[index];
  let currentIndex = index;
  const result: Header[] = [current];
  while (current?.depth > 2) {
    let found = false;
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (rawHeaders[i].depth > 1 && rawHeaders[i].depth === current.depth - 1) {
        current = rawHeaders[i];
        currentIndex = i;
        result.unshift(current);
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  return result;
}

export function highlightText(text: string, query: string): { prefix: string; match: string; suffix: string } | null {
  if (!text || !query) return null;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return null;
  return { prefix: text.slice(0, index), match: text.slice(index, index + query.length), suffix: text.slice(index + query.length) };
}
