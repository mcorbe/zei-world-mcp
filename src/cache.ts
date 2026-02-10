interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }
}

// TTL constants (in ms)
const HOUR = 60 * 60 * 1000;

export const TTL = {
  SECTORS: 24 * HOUR,
  ACTIVITIES: 24 * HOUR,
  COMPANIES: 1 * HOUR,
  BRANDS: 6 * HOUR,
  PROFILE: 30 * 60 * 1000,
  CRITERIA: 30 * 60 * 1000,
} as const;
