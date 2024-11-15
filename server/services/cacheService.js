import NodeCache from 'node-cache';

// Initialize cache with 15 minutes standard TTL
const cache = new NodeCache({ stdTTL: 900 }); // 15 minutes in seconds

// Cache keys
export const CACHE_KEYS = {
  BILLS: (userId) => `bills_${userId}`,
  INCOMES: (userId) => `incomes_${userId}`,
  CATEGORIES: (userId) => `categories_${userId}`,
  PAYMENTS: (userId) => `payments_${userId}`,
  SETTINGS: (userId) => `settings_${userId}`,
};

export const cacheService = {
  // Get data from cache
  get: (key) => {
    return cache.get(key);
  },

  // Set data in cache
  set: (key, data) => {
    cache.set(key, data);
  },

  // Delete specific key from cache
  delete: (key) => {
    cache.del(key);
  },

  // Delete multiple keys that match a pattern
  deletePattern: (pattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchingKeys);
  },

  // Clear all user-related cache
  clearUserCache: (userId) => {
    Object.values(CACHE_KEYS).forEach(keyFn => {
      cache.del(keyFn(userId));
    });
  },
}; 