import { signal } from 'essor';
import type { Header } from '@shared/types/index';

export function useHeaders(initHeaders: Header[]) {
  const headers = signal(initHeaders || []);
  return headers;
}
