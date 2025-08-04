import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

interface CacheConfig {
  maxSize?: number; // Maximum number of entries
  maxAge?: number; // TTL in milliseconds
  staleWhileRevalidate?: number; // Time to serve stale content while revalidating
  keyGenerator?: (req: NextRequest) => string;
  shouldCache?: (req: NextRequest, res: NextResponse) => boolean;
}

interface CacheEntry {
  data: any;
  headers: Record<string, string>;
  status: number;
  timestamp: number;
  etag?: string;
}

export class ResponseCache {
  private cache: LRUCache<string, CacheEntry>;
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 1000,
      maxAge: 5 * 60 * 1000, // 5 minutes default
      staleWhileRevalidate: 60 * 1000, // 1 minute
      keyGenerator: this.defaultKeyGenerator,
      shouldCache: this.defaultShouldCache,
      ...config,
    };

    this.cache = new LRUCache<string, CacheEntry>({
      max: this.config.maxSize,
      ttl: this.config.maxAge,
    });
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const url = new URL(req.url);
    const method = req.method;
    const pathname = url.pathname;
    const search = url.search;
    const userId = req.headers.get('x-user-id') || 'anonymous';
    
    return `cache:${method}:${pathname}${search}:${userId}`;
  }

  private defaultShouldCache(req: NextRequest, res: NextResponse): boolean {
    // Only cache GET requests by default
    if (req.method !== 'GET') return false;
    
    // Don't cache errors (except 404s which might be cacheable)
    const status = res.status;
    if (status >= 400 && status !== 404) return false;
    
    // Respect cache control headers
    const cacheControl = res.headers.get('cache-control');
    if (cacheControl?.includes('no-store') || cacheControl?.includes('private')) {
      return false;
    }
    
    return true;
  }

  private generateETag(data: any): string {
    // Simple ETag generation - in production, use a proper hash
    return `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 27)}"`;
  }

  async get(req: NextRequest): Promise<CacheEntry | null> {
    const key = this.config.keyGenerator(req);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is stale
    const age = Date.now() - entry.timestamp;
    const isStale = age > this.config.maxAge;
    const withinRevalidateWindow = age < this.config.maxAge + this.config.staleWhileRevalidate;
    
    // Return stale entry if within revalidate window
    if (isStale && withinRevalidateWindow) {
      // Mark for background revalidation
      entry.headers['x-cache-status'] = 'stale';
      return entry;
    }
    
    // Entry is fresh
    entry.headers['x-cache-status'] = 'hit';
    entry.headers['x-cache-age'] = Math.floor(age / 1000).toString();
    
    return entry;
  }

  async set(req: NextRequest, res: NextResponse): Promise<void> {
    if (!this.config.shouldCache(req, res)) {
      return;
    }
    
    const key = this.config.keyGenerator(req);
    
    // Extract response data
    const data = await res.json();
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    const entry: CacheEntry = {
      data,
      headers,
      status: res.status,
      timestamp: Date.now(),
      etag: this.generateETag(data),
    };
    
    this.cache.set(key, entry);
  }

  createCachedResponse(entry: CacheEntry): NextResponse {
    const response = NextResponse.json(entry.data, {
      status: entry.status,
      headers: entry.headers,
    });
    
    // Add cache headers
    response.headers.set('x-cache', 'HIT');
    response.headers.set('etag', entry.etag || '');
    
    return response;
  }

  // Middleware helper
  async withCache(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Check ETag
    const ifNoneMatch = req.headers.get('if-none-match');
    
    // Try to get from cache
    const cached = await this.get(req);
    
    if (cached) {
      // Handle ETag validation
      if (ifNoneMatch && cached.etag === ifNoneMatch) {
        return new NextResponse(null, { 
          status: 304,
          headers: {
            'etag': cached.etag,
            'x-cache': 'HIT',
          }
        });
      }
      
      // Return cached response
      return this.createCachedResponse(cached);
    }
    
    // Execute handler and cache result
    const response = await handler(req);
    
    // Cache successful responses
    if (response.ok) {
      await this.set(req, response as NextResponse);
    }
    
    response.headers.set('x-cache', 'MISS');
    
    return response;
  }

  // Clear cache entries
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Clear entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      calculatedSize: this.cache.calculatedSize,
    };
  }
}

// Pre-configured caches for different use cases
export const apiCache = new ResponseCache({
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 60 * 1000, // 1 minute
});

export const userCache = new ResponseCache({
  maxAge: 30 * 1000, // 30 seconds
  staleWhileRevalidate: 10 * 1000, // 10 seconds
  keyGenerator: (req) => {
    const url = new URL(req.url);
    const userId = req.headers.get('x-user-id') || 'anonymous';
    return `user:${userId}:${url.pathname}${url.search}`;
  },
});

export const staticCache = new ResponseCache({
  maxAge: 60 * 60 * 1000, // 1 hour
  staleWhileRevalidate: 5 * 60 * 1000, // 5 minutes
});

// Query result cache for database queries
export class QueryCache<T extends {} = any> {
  private cache: LRUCache<string, T>;

  constructor(options: { maxSize?: number; ttl?: number } = {}) {
    this.cache = new LRUCache<string, T>({
      max: options.maxSize || 100,
      ttl: options.ttl || 60 * 1000, // 1 minute default
    });
  }

  async get<R = T>(
    key: string,
    fetcher: () => Promise<R>,
    ttl?: number
  ): Promise<R> {
    const cached = this.cache.get(key) as R | undefined;
    if (cached !== undefined) {
      return cached;
    }

    const result = await fetcher();
    this.cache.set(key, result as any, { ttl });
    
    return result;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string | RegExp): void {
    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global query cache instance
export const queryCache = new QueryCache({
  maxSize: 500,
  ttl: 60 * 1000, // 1 minute
});