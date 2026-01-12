// Test setup file
import { vi } from 'vitest';

// Mock IndexedDB for browser tests
const indexedDB = {
  open: vi.fn(() => ({
    result: {
      objectStoreNames: { contains: () => false },
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
        })),
      })),
    },
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  })),
};

if (typeof globalThis.indexedDB === 'undefined') {
  (globalThis as any).indexedDB = indexedDB;
}
