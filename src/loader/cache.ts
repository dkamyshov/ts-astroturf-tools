interface CacheItem {
  errors: string[];
  warnings: string[];
}

/**
 * Singleton used to store compilation data.
 */
export const cache: {
  [resourcePath: string]: CacheItem;
} = {};
