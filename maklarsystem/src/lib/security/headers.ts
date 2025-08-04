import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | false;
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | false;
  xContentTypeOptions?: boolean;
  strictTransportSecurity?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  } | false;
  xXssProtection?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

// Default CSP for Swedish real estate application
const DEFAULT_CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://*.supabase.co'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
  'media-src': ["'self'", 'https://*.supabase.co'],
  'object-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig = {}) {
    this.config = {
      contentSecurityPolicy: this.buildCSP(DEFAULT_CSP),
      xFrameOptions: 'DENY',
      xContentTypeOptions: true,
      strictTransportSecurity: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      xXssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      ...config,
    };
  }

  /**
   * Build CSP string from directives object
   */
  private buildCSP(directives: Record<string, string[]>): string {
    return Object.entries(directives)
      .map(([key, values]) => {
        if (values.length === 0) return key;
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');
  }

  /**
   * Apply security headers to response
   */
  applyHeaders(response: NextResponse): void {
    // Content Security Policy
    if (this.config.contentSecurityPolicy !== false) {
      response.headers.set(
        'Content-Security-Policy',
        this.config.contentSecurityPolicy as string
      );
    }

    // X-Frame-Options
    if (this.config.xFrameOptions !== false && this.config.xFrameOptions) {
      response.headers.set('X-Frame-Options', this.config.xFrameOptions);
    }

    // X-Content-Type-Options
    if (this.config.xContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Strict-Transport-Security
    if (this.config.strictTransportSecurity !== false && this.config.strictTransportSecurity) {
      const sts = this.config.strictTransportSecurity;
      let value = `max-age=${sts.maxAge}`;
      if (sts.includeSubDomains) value += '; includeSubDomains';
      if (sts.preload) value += '; preload';
      response.headers.set('Strict-Transport-Security', value);
    }

    // X-XSS-Protection
    if (this.config.xXssProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      response.headers.set('Referrer-Policy', this.config.referrerPolicy);
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      response.headers.set('Permissions-Policy', this.config.permissionsPolicy);
    }

    // Cross-Origin policies
    if (this.config.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    }

    if (this.config.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    }

    if (this.config.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
    }
  }

  /**
   * Middleware to add security headers
   */
  async middleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const response = await handler(req);
    this.applyHeaders(response);
    return response;
  }
}

// Pre-configured security header sets
export const strictSecurityHeaders = new SecurityHeaders();

export const moderateSecurityHeaders = new SecurityHeaders({
  xFrameOptions: 'SAMEORIGIN',
  crossOriginEmbedderPolicy: 'unsafe-none',
  crossOriginResourcePolicy: 'cross-origin',
});

export const developmentSecurityHeaders = new SecurityHeaders({
  contentSecurityPolicy: false, // Disable CSP in development
  strictTransportSecurity: false, // Disable HSTS in development
  xFrameOptions: 'SAMEORIGIN',
  crossOriginEmbedderPolicy: 'unsafe-none',
  crossOriginOpenerPolicy: 'unsafe-none',
  crossOriginResourcePolicy: 'cross-origin',
});

// Helper to create custom CSP
export function createCSP(customDirectives: Partial<typeof DEFAULT_CSP>): string {
  const merged = { ...DEFAULT_CSP, ...customDirectives };
  return Object.entries(merged)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

// Middleware wrapper
export async function withSecurityHeaders(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  headers?: SecurityHeaders
): Promise<NextResponse> {
  const securityHeaders = headers || (
    process.env.NODE_ENV === 'production' 
      ? strictSecurityHeaders 
      : developmentSecurityHeaders
  );
  
  return securityHeaders.middleware(req, handler);
}