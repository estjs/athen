import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SearchIndexCache } from '../../src/client/SearchIndexCache';

/**
 * In-memory IndexedDB stub that's just complete enough to drive SearchIndexCache.
 * Each request fires its 'success' handler asynchronously to mirror real IDB.
 */
function installFakeIndexedDB() {
  const stores = new Map<string, Map<string, unknown>>();

  function withEventTarget<T>(): { obj: any; fire: (event: string, value?: T) => void } {
    const listeners: Record<string, ((event: any) => void)[]> = {};
    const obj: any = {
      result: undefined,
      error: null,
      addEventListener(event: string, handler: any) {
        (listeners[event] ||= []).push(handler);
      },
      set onsuccess(handler: any) {
        if (handler) (listeners.success ||= []).push(handler);
      },
      set onerror(handler: any) {
        if (handler) (listeners.error ||= []).push(handler);
      },
      set onupgradeneeded(handler: any) {
        if (handler) (listeners.upgradeneeded ||= []).push(handler);
      },
    };
    const fire = (event: string, value?: any) => {
      if (value !== undefined) obj.result = value;
      const e = { target: obj };
      for (const handler of listeners[event] || []) handler(e);
    };
    return { obj, fire };
  }

  function objectStore(name: string) {
    const store = stores.get(name)!;
    return {
      get(key: string) {
        const { obj, fire } = withEventTarget();
        queueMicrotask(() => fire('success', store.get(key)));
        return obj;
      },
      put(entry: { key: string }) {
        const { obj, fire } = withEventTarget();
        store.set(entry.key, entry);
        queueMicrotask(() => fire('success'));
        return obj;
      },
      delete(key: string) {
        const { obj, fire } = withEventTarget();
        store.delete(key);
        queueMicrotask(() => fire('success'));
        return obj;
      },
      clear() {
        const { obj, fire } = withEventTarget();
        store.clear();
        queueMicrotask(() => fire('success'));
        return obj;
      },
    };
  }

  const fakeDb = {
    objectStoreNames: { contains: (name: string) => stores.has(name) },
    createObjectStore: (name: string) => {
      stores.set(name, new Map());
      return objectStore(name);
    },
    transaction: (names: string[]) => ({
      objectStore: () => objectStore(names[0]),
    }),
  };

  (globalThis as any).indexedDB = {
    open() {
      const { obj, fire } = withEventTarget();
      queueMicrotask(() => {
        if (!stores.has('search-index')) {
          // Drive the upgrade path so the cache can lazily create its store
          obj.result = fakeDb;
          fire('upgradeneeded');
        }
        fire('success', fakeDb);
      });
      return obj;
    },
  };

  return { stores };
}

describe('SearchIndexCache', () => {
  beforeEach(() => {
    installFakeIndexedDB();
  });

  afterEach(() => {
    delete (globalThis as any).indexedDB;
  });

  it('stores and retrieves data round-trip', async () => {
    const cache = new SearchIndexCache();
    await cache.set('payload', { hello: 'world' });
    expect(await cache.get('payload')).toEqual({ hello: 'world' });
  });

  it('returns null for unknown keys', async () => {
    const cache = new SearchIndexCache();
    expect(await cache.get('missing')).toBeNull();
  });

  it('treats entries older than maxAge as missing', async () => {
    const cache = new SearchIndexCache({ maxAge: 1 });
    await cache.set('stale', { v: 1 });
    await new Promise((r) => setTimeout(r, 5));
    expect(await cache.get('stale')).toBeNull();
  });

  it('delete removes the entry', async () => {
    const cache = new SearchIndexCache();
    await cache.set('drop', { v: 1 });
    await cache.delete('drop');
    expect(await cache.get('drop')).toBeNull();
  });

  it('clear empties the entire store', async () => {
    const cache = new SearchIndexCache();
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.clear();
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBeNull();
  });
});
