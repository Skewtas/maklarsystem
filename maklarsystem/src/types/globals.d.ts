/**
 * Global type declarations for enhanced type safety
 */

// Enhance built-in types
declare global {
  // Environment variables type safety
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test'
      readonly NEXT_PUBLIC_SUPABASE_URL: string
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      readonly SUPABASE_SERVICE_ROLE_KEY?: string
      readonly NEXTAUTH_URL?: string
      readonly NEXTAUTH_SECRET?: string
      readonly APP_NAME?: string
      readonly APP_URL?: string
      readonly DATABASE_URL?: string
      readonly SMTP_HOST?: string
      readonly SMTP_PORT?: string
      readonly SMTP_USER?: string
      readonly SMTP_PASS?: string
      readonly SMTP_FROM?: string
      readonly VITEC_API_KEY?: string
      readonly HEMNET_API_KEY?: string
      readonly MAX_FILE_SIZE?: string
      readonly ALLOWED_FILE_TYPES?: string
      readonly BCRYPT_ROUNDS?: string
      readonly JWT_SECRET?: string
      readonly GOOGLE_ANALYTICS_ID?: string
      readonly HOTJAR_ID?: string
      readonly SENTRY_DSN?: string
    }
  }

  // Array prototype enhancements
  interface Array<T> {
    safeGet(index: number): T | undefined
  }

  // String prototype enhancements for validation
  interface String {
    isValidEmail(): boolean
    isValidUUID(): boolean
    isValidPhoneNumber(): boolean
  }
}

// Make the file a module
export {}

// Array prototype implementation
Array.prototype.safeGet = function<T>(this: T[], index: number): T | undefined {
  return index >= 0 && index < this.length ? this[index] : undefined
}

// String prototype implementations
String.prototype.isValidEmail = function(this: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(this)
}

String.prototype.isValidUUID = function(this: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(this)
}

String.prototype.isValidPhoneNumber = function(this: string): boolean {
  const phoneRegex = /^(\+46|0)[1-9]\d{7,9}$/
  return phoneRegex.test(this.replace(/\s|-/g, ''))
} 