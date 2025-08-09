import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  message?: string; // Custom error message
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private cache: LRUCache<string, RateLimitInfo>;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      message: 'För många förfrågningar, vänligen försök igen senare.',
      ...config,
    };

    // Initialize LRU cache with TTL based on window size
    this.cache = new LRUCache<string, RateLimitInfo>({
      max: 5000, // Maximum number of items in cache
      ttl: this.config.windowMs, // Time to live in milliseconds
    });
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Get IP from various headers (supports proxy scenarios)
    const forwarded = req.headers.get('x-forwarded-for');
    const real = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || real || 'unknown';
    
    return `rate-limit:${ip}`;
  }

  async isRateLimited(req: NextRequest): Promise<boolean> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    
    let info = this.cache.get(key);
    
    if (!info) {
      // First request in window
      info = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.cache.set(key, info);
      return false;
    }

    // Check if window has expired
    if (now > info.resetTime) {
      info = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.cache.set(key, info);
      return false;
    }

    // Increment count and check limit
    info.count++;
    this.cache.set(key, info);

    return info.count > this.config.maxRequests;
  }

  getRemainingRequests(req: NextRequest): number {
    const key = this.config.keyGenerator(req);
    const info = this.cache.get(key);
    
    if (!info) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - info.count);
  }

  getResetTime(req: NextRequest): number {
    const key = this.config.keyGenerator(req);
    const info = this.cache.get(key);
    
    if (!info) {
      return Date.now() + this.config.windowMs;
    }

    return info.resetTime;
  }

  getRetryAfter(req: NextRequest): number {
    const resetTime = this.getResetTime(req);
    const now = Date.now();
    return Math.max(0, Math.ceil((resetTime - now) / 1000)); // Return seconds
  }

  createRateLimitResponse(req: NextRequest): NextResponse {
    const retryAfter = this.getRetryAfter(req);
    const remaining = this.getRemainingRequests(req);
    const resetTime = this.getResetTime(req);

    return new NextResponse(
      JSON.stringify({
        error: this.config.message,
        retryAfter,
        resetTime: new Date(resetTime).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }
}

// Factory function for creating rate limiters with different configs
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'För många inloggningsförsök. Vänligen försök igen senare.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 uploads per hour
  message: 'För många uppladdningar. Vänligen försök igen senare.',
});

// User-based rate limiter (requires authenticated context)
export function createUserRateLimiter(config: Omit<RateLimitConfig, 'keyGenerator'>): RateLimiter {
  return new RateLimiter({
    ...config,
    keyGenerator: (req: NextRequest) => {
      // This would need to extract user ID from JWT or session
      // For now, we'll use a placeholder
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `rate-limit:user:${userId}`;
    },
  });
}

// Rate limit middleware
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimiter: RateLimiter = apiRateLimiter
): Promise<NextResponse> {
  const isLimited = await rateLimiter.isRateLimited(req);
  
  if (isLimited) {
    return rateLimiter.createRateLimitResponse(req);
  }

  // Add rate limit headers to successful responses
  const response = await handler(req);
  
  if (response) {
    response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimiter.getRemainingRequests(req).toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimiter.getResetTime(req)).toISOString());
  }

  return response;
}