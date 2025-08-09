// Export all performance modules
export * from './cache';
export * from './database';
export * from './compression';

// Re-export commonly used items
export {
  apiCache,
  userCache,
  staticCache,
  queryCache,
  ResponseCache,
  QueryCache
} from './cache';

export {
  createOptimizedQuery,
  OptimizedQuery,
  RECOMMENDED_INDEXES,
  OPTIMIZATION_TIPS
} from './database';

export {
  compressionMiddleware,
  withCompression,
  compressionHelpers,
  CompressionMiddleware
} from './compression';