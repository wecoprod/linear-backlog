interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): { data: T; isStale: boolean } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return {
      data: entry.data,
      isStale: Date.now() > entry.expiresAt,
    };
  }

  set(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}
