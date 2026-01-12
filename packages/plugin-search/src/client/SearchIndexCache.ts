export interface CacheOptions {
  dbName?: string;
  storeName?: string;
  maxAge?: number;
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
}

const DEFAULT_DB_NAME = 'athen-search';
const DEFAULT_STORE_NAME = 'search-index';
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000;

export class SearchIndexCache {
  private dbName: string;
  private storeName: string;
  private maxAge: number;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(options: CacheOptions = {}) {
    this.dbName = options.dbName ?? DEFAULT_DB_NAME;
    this.storeName = options.storeName ?? DEFAULT_STORE_NAME;
    this.maxAge = options.maxAge ?? DEFAULT_MAX_AGE;
  }

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => { this.db = request.result; resolve(); };
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'key' });
          }
        };
      } catch (error) { reject(error); }
    });
    return this.initPromise;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.db) await this.init();
      if (!this.db) return null;
      return new Promise((resolve, reject) => {
        const store = this.db!.transaction([this.storeName], 'readonly').objectStore(this.storeName);
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result as CacheEntry<T> | undefined;
          if (result && Date.now() - result.timestamp <= this.maxAge) {
            resolve(result.data);
          } else {
            if (result) this.delete(key).catch(() => {});
            resolve(null);
          }
        };
      });
    } catch { return null; }
  }

  async set<T>(key: string, data: T): Promise<void> {
    try {
      if (!this.db) await this.init();
      if (!this.db) return;
      return new Promise((resolve, reject) => {
        const store = this.db!.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
        const request = store.put({ key, data, timestamp: Date.now() });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {}
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.db) await this.init();
      if (!this.db) return;
      return new Promise((resolve, reject) => {
        const store = this.db!.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {}
  }

  async clear(): Promise<void> {
    try {
      if (!this.db) await this.init();
      if (!this.db) return;
      return new Promise((resolve, reject) => {
        const store = this.db!.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {}
  }
}
