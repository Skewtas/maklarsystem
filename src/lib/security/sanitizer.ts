// Edge Runtime compatible sanitizer without jsdom dependency

export type SanitizationProfile = 'strict' | 'moderate' | 'minimal';

interface SanitizationConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  KEEP_CONTENT?: boolean;
  SAFE_FOR_TEMPLATES?: boolean;
}

// Sanitization profiles with Swedish character support
const SANITIZATION_PROFILES: Record<SanitizationProfile, SanitizationConfig> = {
  strict: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    SAFE_FOR_TEMPLATES: true,
  },
  moderate: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    SAFE_FOR_TEMPLATES: true,
  },
  minimal: {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
    ALLOW_DATA_ATTR: true,
    KEEP_CONTENT: true,
    SAFE_FOR_TEMPLATES: false,
  },
};

export interface SanitizationOptions {
  profile?: SanitizationProfile;
  customConfig?: SanitizationConfig;
  preserveSwedishChars?: boolean;
  logEvents?: boolean;
}

export interface SanitizationResult {
  clean: string;
  removed: string[];
  sanitized: boolean;
}

class Sanitizer {
  private profile: SanitizationProfile;
  private customConfig?: SanitizationConfig;
  private logEvents: boolean;

  constructor(options: SanitizationOptions = {}) {
    this.profile = options.profile || 'moderate';
    this.customConfig = options.customConfig;
    this.logEvents = options.logEvents || false;
  }

  /**
   * Basic HTML entity encoding for security
   */
  private encodeHtmlEntities(str: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return str.replace(/[&<>"'\/]/g, (match) => htmlEntities[match] || match);
  }

  /**
   * Remove dangerous HTML patterns using regex
   */
  private removeDangerousPatterns(input: string): { clean: string; removed: string[] } {
    const removed: string[] = [];
    let clean = input;

    // Remove script tags and content
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match) => {
      removed.push(match);
      return '';
    });

    // Remove style tags and content
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, (match) => {
      removed.push(match);
      return '';
    });

    // Remove event handlers
    clean = clean.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, (match) => {
      removed.push(match);
      return '';
    });

    // Remove javascript: URLs
    clean = clean.replace(/javascript:\s*[^"'\s]*/gi, (match) => {
      removed.push(match);
      return '';
    });

    return { clean, removed };
  }

  /**
   * Sanitize a string input
   */
  sanitize(input: string): SanitizationResult {
    if (typeof input !== 'string') {
      return {
        clean: '',
        removed: [],
        sanitized: false,
      };
    }

    const config = this.customConfig || SANITIZATION_PROFILES[this.profile];
    const { clean: dangerousRemoved, removed } = this.removeDangerousPatterns(input);
    
    let clean = dangerousRemoved;

    // For strict profile, encode all HTML entities
    if (this.profile === 'strict' || (config.ALLOWED_TAGS && config.ALLOWED_TAGS.length === 0)) {
      clean = this.encodeHtmlEntities(clean);
    }

    // Log sanitization events if enabled
    if (this.logEvents && removed.length > 0) {
      console.warn('[Sanitizer] Removed potentially dangerous content:', {
        original: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
        removed,
        profile: this.profile,
      });
    }

    return {
      clean,
      removed,
      sanitized: removed.length > 0 || clean !== input,
    };
  }

  /**
   * Sanitize all string properties in an object
   */
  sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = { ...obj };
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        const result = this.sanitize(value);
        sanitized[key] = result.clean;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitize(item).clean : 
          item && typeof item === 'object' ? this.sanitizeObject(item) : item
        );
      }
    }
    
    return sanitized as T;
  }

  /**
   * Create a custom sanitizer for specific use cases
   */
  static createCustomSanitizer(config: SanitizationConfig, logEvents = false): Sanitizer {
    return new Sanitizer({
      customConfig: config,
      logEvents,
    });
  }
}

// Pre-configured sanitizers for different contexts
export const strictSanitizer = new Sanitizer({ profile: 'strict', logEvents: true });
export const moderateSanitizer = new Sanitizer({ profile: 'moderate', logEvents: true });
export const minimalSanitizer = new Sanitizer({ profile: 'minimal', logEvents: true });

// Specialized sanitizers for Swedish real estate data
export const addressSanitizer = new Sanitizer({
  profile: 'strict',
  customConfig: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  logEvents: true,
});

export const descriptionSanitizer = new Sanitizer({
  profile: 'moderate',
  customConfig: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  logEvents: true,
});

// Utility functions for common sanitization tasks
export function sanitizeString(input: string, profile: SanitizationProfile = 'moderate'): string {
  const sanitizer = new Sanitizer({ profile });
  return sanitizer.sanitize(input).clean;
}

export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  profile: SanitizationProfile = 'moderate'
): T {
  const sanitizer = new Sanitizer({ profile });
  return sanitizer.sanitizeObject(data);
}

// Swedish-specific sanitization that preserves special characters
export function sanitizeSwedishText(input: string): string {
  // First apply normal sanitization
  const sanitizer = new Sanitizer({ profile: 'moderate' });
  const result = sanitizer.sanitize(input);
  
  // Ensure Swedish characters are preserved (å, ä, ö, Å, Ä, Ö)
  const swedishChars = /[åäöÅÄÖ]/g;
  const originalSwedishChars = input.match(swedishChars) || [];
  const sanitizedSwedishChars = result.clean.match(swedishChars) || [];
  
  if (originalSwedishChars.length !== sanitizedSwedishChars.length) {
    console.warn('[Sanitizer] Swedish characters may have been affected during sanitization');
  }
  
  return result.clean;
}

export default Sanitizer;