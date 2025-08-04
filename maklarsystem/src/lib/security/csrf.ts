import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

interface CSRFConfig {
  tokenLength?: number;
  tokenLifetime?: number; // milliseconds
  cookieName?: string;
  headerName?: string;
  parameterName?: string;
  doubleSubmit?: boolean; // Use double-submit pattern instead of session-based
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
  httpOnly?: boolean;
}

interface CSRFToken {
  token: string;
  createdAt: number;
}

class CSRFProtection {
  private config: Required<CSRFConfig>;
  private tokenCache: LRUCache<string, CSRFToken>;

  constructor(config: CSRFConfig = {}) {
    this.config = {
      tokenLength: 32,
      tokenLifetime: 60 * 60 * 1000, // 1 hour
      cookieName: 'csrf-token',
      headerName: 'x-csrf-token',
      parameterName: 'csrfToken',
      doubleSubmit: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      ...config,
    };

    // Initialize token cache for session-based CSRF
    this.tokenCache = new LRUCache<string, CSRFToken>({
      max: 10000,
      ttl: this.config.tokenLifetime,
    });
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return randomBytes(this.config.tokenLength).toString('hex');
  }

  /**
   * Store token in cache (for session-based CSRF)
   */
  storeToken(sessionId: string, token: string): void {
    this.tokenCache.set(sessionId, {
      token,
      createdAt: Date.now(),
    });
  }

  /**
   * Retrieve token from cache (for session-based CSRF)
   */
  getStoredToken(sessionId: string): string | null {
    const tokenData = this.tokenCache.get(sessionId);
    if (!tokenData) return null;
    
    // Check if token has expired
    if (Date.now() - tokenData.createdAt > this.config.tokenLifetime) {
      this.tokenCache.delete(sessionId);
      return null;
    }
    
    return tokenData.token;
  }

  /**
   * Create CSRF token cookie
   */
  createTokenCookie(token: string): string {
    const cookieOptions = [
      `${this.config.cookieName}=${token}`,
      `Max-Age=${Math.floor(this.config.tokenLifetime / 1000)}`,
      `SameSite=${this.config.sameSite}`,
      'Path=/',
    ];

    if (this.config.secure) {
      cookieOptions.push('Secure');
    }

    if (this.config.httpOnly) {
      cookieOptions.push('HttpOnly');
    }

    return cookieOptions.join('; ');
  }

  /**
   * Extract CSRF token from request
   */
  extractToken(req: NextRequest): string | null {
    // Check header first
    const headerToken = req.headers.get(this.config.headerName);
    if (headerToken) return headerToken;

    // Check body/query parameters
    const url = new URL(req.url);
    const queryToken = url.searchParams.get(this.config.parameterName);
    if (queryToken) return queryToken;

    // For double-submit pattern, also check cookie
    if (this.config.doubleSubmit) {
      const cookieToken = req.cookies.get(this.config.cookieName)?.value;
      return cookieToken || null;
    }

    return null;
  }

  /**
   * Validate CSRF token
   */
  async validateToken(req: NextRequest, sessionId?: string): Promise<boolean> {
    const submittedToken = this.extractToken(req);
    if (!submittedToken) return false;

    if (this.config.doubleSubmit) {
      // Double-submit pattern: compare submitted token with cookie
      const cookieToken = req.cookies.get(this.config.cookieName)?.value;
      return cookieToken === submittedToken;
    } else {
      // Session-based pattern: compare with stored token
      if (!sessionId) return false;
      const storedToken = this.getStoredToken(sessionId);
      return storedToken === submittedToken;
    }
  }

  /**
   * Create response with CSRF token
   */
  addTokenToResponse(response: NextResponse, token: string): void {
    response.headers.set('Set-Cookie', this.createTokenCookie(token));
    
    // Also add token to response headers for JavaScript access
    response.headers.set('X-CSRF-Token', token);
  }

  /**
   * Middleware to protect routes with CSRF
   */
  async protect(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    sessionId?: string
  ): Promise<NextResponse> {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return handler(req);
    }

    // Validate CSRF token
    const isValid = await this.validateToken(req, sessionId);
    
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({
          error: 'Ogiltig CSRF-token. Vänligen ladda om sidan och försök igen.',
          code: 'CSRF_VALIDATION_FAILED',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return handler(req);
  }
}

// Default CSRF protection instances
export const sessionCSRF = new CSRFProtection({
  doubleSubmit: false,
  tokenLifetime: 60 * 60 * 1000, // 1 hour
});

export const doubleSubmitCSRF = new CSRFProtection({
  doubleSubmit: true,
  httpOnly: false, // Must be accessible to JavaScript for double-submit
  tokenLifetime: 24 * 60 * 60 * 1000, // 24 hours
});

// React Hook Form integration helper
export interface CSRFFieldProps {
  name: string;
  value: string;
}

export function getCSRFFieldProps(token: string): CSRFFieldProps {
  return {
    name: 'csrfToken',
    value: token,
  };
}

// Helper for adding CSRF token to fetch requests
export function addCSRFHeader(headers: HeadersInit, token: string): HeadersInit {
  if (headers instanceof Headers) {
    headers.set('X-CSRF-Token', token);
    return headers;
  }
  
  return {
    ...headers,
    'X-CSRF-Token': token,
  };
}

// Next.js API route helper
export async function withCSRFProtection(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    sessionId?: string;
    csrf?: CSRFProtection;
  }
): Promise<NextResponse> {
  const csrf = options?.csrf || sessionCSRF;
  return csrf.protect(req, handler, options?.sessionId);
}

// Client-side helpers
export const csrfHelpers = {
  /**
   * Get CSRF token from cookie (for double-submit pattern)
   */
  getTokenFromCookie(cookieName = 'csrf-token'): string | null {
    if (typeof document === 'undefined') return null;
    
    const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
    return match ? match[1] : null;
  },

  /**
   * Get CSRF token from meta tag
   */
  getTokenFromMeta(metaName = 'csrf-token'): string | null {
    if (typeof document === 'undefined') return null;
    
    const meta = document.querySelector(`meta[name="${metaName}"]`);
    return meta ? meta.getAttribute('content') : null;
  },

  /**
   * Add CSRF token to FormData
   */
  addTokenToFormData(formData: FormData, token: string, fieldName = 'csrfToken'): void {
    formData.set(fieldName, token);
  },

  /**
   * Create headers with CSRF token
   */
  createHeaders(token: string): HeadersInit {
    return {
      'X-CSRF-Token': token,
      'Content-Type': 'application/json',
    };
  },
};

export default CSRFProtection;