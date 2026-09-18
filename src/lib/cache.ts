interface CacheEntry<T> {
  ts: number;
  data: T;
}

export function readCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > ttlMs) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function writeCache(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    return true;
  } catch {
    return false;
  }
}
