import { useSignal } from 'essor';
import type { Signal } from 'essor';
import type { Header } from '@shared/types/index';

export function useHeaders(initHeaders: Header[]) {
  const headers = useSignal(initHeaders || []);
  const setHeaders = (newHeaders: Header[]) => {
    headers.value = newHeaders;
  };

  return [headers, setHeaders] as [Signal<Header[]>, typeof setHeaders];
}
