import { NextRequest, NextResponse } from 'next/server';
import { 
  apiRateLimiter, 
  authRateLimiter, 
  uploadRateLimiter,
  withRateLimit 
} from '@/lib/security/rateLimiter';
import { 
  sanitizeFormData,
  moderateSanitizer,
  strictSanitizer 
} from '@/lib/security/sanitizer';
import { 
  withCSRFProtection,
  sessionCSRF,
  doubleSubmitCSRF 
} from '@/lib/security/csrf';
import { 
  withSecurityHeaders,
  strictSecurityHeaders,
  developmentSecurityHeaders 
} from '@/lib/security/headers';

export interface SecurityMiddlewareOptions {
  rateLimit?: {
    enabled: boolean;
    type?: 'api' | 'auth' | 'upload' | 'custom';
    customLimiter?: any;
  };
  csrf?: {
    enabled: boolean;
    type?: 'session' | 'doubleSubmit';
    sessionIdExtractor?: (req: NextRequest) => string | undefined;
  };
  sanitization?: {
    enabled: boolean;
    profile?: 'strict' | 'moderate' | 'minimal';
  };
  headers?: {
    enabled: boolean;
    strict?: boolean;
  };
}

const DEFAULT_OPTIONS: SecurityMiddlewareOptions = {
  rateLimit: {
    enabled: true,
    type: 'api',
  },
  csrf: {
    enabled: true,
    type: 'doubleSubmit',
  },
  sanitization: {
    enabled: true,
    profile: 'moderate',
  },
  headers: {
    enabled: true,
    strict: process.env.NODE_ENV === 'production',
  },
};

/**
 * Comprehensive security middleware that combines all security features
 */
export async function securityMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: SecurityMiddlewareOptions = DEFAULT_OPTIONS
): Promise<NextResponse> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Apply rate limiting
  if (mergedOptions.rateLimit?.enabled) {
    const rateLimiter = 
      mergedOptions.rateLimit.customLimiter ||
      (mergedOptions.rateLimit.type === 'auth' ? authRateLimiter :
       mergedOptions.rateLimit.type === 'upload' ? uploadRateLimiter :
       apiRateLimiter);

    const rateLimitResult = await withRateLimit(req, async (req) => {
      // Continue to next middleware
      return NextResponse.next();
    }, rateLimiter);

    if (rateLimitResult.status === 429) {
      return rateLimitResult;
    }
  }

  // Apply CSRF protection for state-changing methods
  if (mergedOptions.csrf?.enabled && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const csrf = mergedOptions.csrf.type === 'session' ? sessionCSRF : doubleSubmitCSRF;
    const sessionId = mergedOptions.csrf.sessionIdExtractor?.(req);

    const csrfResult = await withCSRFProtection(req, async (req) => {
      return NextResponse.next();
    }, { csrf, sessionId });

    if (csrfResult.status === 403) {
      return csrfResult;
    }
  }

  // Sanitize request body if present
  if (mergedOptions.sanitization?.enabled && req.body) {
    try {
      const body = await req.json();
      const sanitizedBody = sanitizeFormData(body, mergedOptions.sanitization.profile);
      
      // Create new request with sanitized body
      const sanitizedReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(sanitizedBody),
      });

      // Copy cookies
      req.cookies.getAll().forEach(cookie => {
        sanitizedReq.cookies.set(cookie.name, cookie.value);
      });

      req = sanitizedReq;
    } catch (error) {
      // Body might not be JSON or already consumed
      console.warn('Failed to sanitize request body:', error);
    }
  }

  // Apply security headers
  if (mergedOptions.headers?.enabled) {
    const headers = mergedOptions.headers.strict 
      ? strictSecurityHeaders 
      : developmentSecurityHeaders;

    return withSecurityHeaders(req, handler, headers);
  }

  return handler(req);
}

/**
 * Create route-specific security middleware
 */
export function createRouteSecurityMiddleware(
  routeOptions: SecurityMiddlewareOptions
) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ) => {
    return securityMiddleware(req, handler, routeOptions);
  };
}

// Pre-configured middleware for common routes
export const publicRouteMiddleware = createRouteSecurityMiddleware({
  rateLimit: { enabled: true, type: 'api' },
  csrf: { enabled: false },
  sanitization: { enabled: false }, // Disable for server actions
  headers: { enabled: true },
});

export const authRouteMiddleware = createRouteSecurityMiddleware({
  rateLimit: { enabled: true, type: 'auth' },
  csrf: { enabled: true, type: 'doubleSubmit' },
  sanitization: { enabled: true, profile: 'strict' },
  headers: { enabled: true, strict: true },
});

export const apiRouteMiddleware = createRouteSecurityMiddleware({
  rateLimit: { enabled: true, type: 'api' },
  csrf: { enabled: true, type: 'doubleSubmit' },
  sanitization: { enabled: true, profile: 'moderate' },
  headers: { enabled: true },
});

export const uploadRouteMiddleware = createRouteSecurityMiddleware({
  rateLimit: { enabled: true, type: 'upload' },
  csrf: { enabled: true, type: 'doubleSubmit' },
  sanitization: { enabled: false }, // Don't sanitize file uploads
  headers: { enabled: true },
});

// Helper to extract session ID from Supabase auth
export function extractSupabaseSessionId(req: NextRequest): string | undefined {
  const authCookie = req.cookies.get('sb-auth-token');
  if (!authCookie) return undefined;
  
  try {
    const decoded = JSON.parse(authCookie.value);
    return decoded.access_token || decoded.session_id;
  } catch {
    return undefined;
  }
}