/**
 * Client-side caching service for Firebase data
 * This service helps reduce API calls by caching frequently accessed data
 */

interface CacheOptions {
  /** Time in milliseconds before the cache entry expires */
  ttl?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Default options
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get an item from the cache
 * @param key The cache key
 * @returns The cached item or null if not found or expired
 */
export function getCachedItem<T>(key: string): T | null {
  try {
    const cacheKey = `chordcraft_cache_${key}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const entry = JSON.parse(cachedData) as CacheEntry<T>;
    const now = Date.now();

    // Check if the cached data has expired
    if (now > entry.expiry) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Error getting cached item:", error);
    return null;
  }
}

/**
 * Store an item in the cache
 * @param key The cache key
 * @param data The data to cache
 * @param options Caching options
 */
export function setCachedItem<T>(key: string, data: T, options: CacheOptions = {}): void {
  try {
    const cacheKey = `chordcraft_cache_${key}`;
    const ttl = options.ttl || DEFAULT_TTL;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error("Error setting cached item:", error);
  }
}

/**
 * Clear all cached data or specific entries
 * @param pattern Optional pattern to match against cache keys
 */
export function clearCache(pattern?: string): void {
  try {
    const prefix = "chordcraft_cache_";

    if (pattern) {
      // Iterate through localStorage and remove matching items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix) && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      }
    } else {
      // Clear all cache entries
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}
