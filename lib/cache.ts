export type MarketCache<T = unknown> = {
    data: T | null;
    lastUpdated: number;
    promise: Promise<T> | null;
}

// Global cache object to persist across invocations in development
// In serverless, this might reset, but for "bun run dev" it works fine.
// For production serverless, one would use Redis/KV.
const globalCache: { [key: string]: MarketCache<unknown> } = {
    crypto: { data: null, lastUpdated: 0, promise: null },
    stocks: { data: null, lastUpdated: 0, promise: null },
    forex: { data: null, lastUpdated: 0, promise: null }
};

export const CACHE_TTL_MS = 60 * 1000; // 1 minute cache to stay safe within free limits

export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cacheEntry = globalCache[key] as MarketCache<T>;
  
  if (!cacheEntry) {
      throw new Error(`Invalid cache key: ${key}`);
  }

  const now = Date.now();

  // If we have valid cached data, return it
  if (cacheEntry.data && (now - cacheEntry.lastUpdated < CACHE_TTL_MS)) {
      return cacheEntry.data;
  }

  // If a request is already in flight, reuse that promise to prevent stampedes
  if (cacheEntry.promise) {
      return cacheEntry.promise;
  }

  // Otherwise, fetch new data
  cacheEntry.promise = fetchFn().then(data => {
      cacheEntry.data = data;
      cacheEntry.lastUpdated = Date.now();
      cacheEntry.promise = null; // Clear promise after done
      return data;
  }).catch((err: Error) => {
      cacheEntry.promise = null;
      console.error(`Error fetching ${key}:`, err);
      throw err;
  });

  return cacheEntry.promise;
}
