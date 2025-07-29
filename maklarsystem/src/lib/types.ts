/**
 * Type utilities for strict type checking and runtime validation
 */

// Utility types for better type safety
export type NonEmptyString = string & { __brand: 'NonEmptyString' }
export type PositiveNumber = number & { __brand: 'PositiveNumber' }
export type EmailAddress = string & { __brand: 'EmailAddress' }
export type PhoneNumber = string & { __brand: 'PhoneNumber' }
export type UUID = string & { __brand: 'UUID' }

// Type guards for runtime validation
export function isNonEmptyString(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && value.trim().length > 0
}

export function isPositiveNumber(value: unknown): value is PositiveNumber {
  return typeof value === 'number' && value > 0 && !Number.isNaN(value)
}

export function isValidEmail(value: unknown): value is EmailAddress {
  if (typeof value !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

export function isValidPhoneNumber(value: unknown): value is PhoneNumber {
  if (typeof value !== 'string') return false
  // Swedish phone number pattern (basic)
  const phoneRegex = /^(\+46|0)[1-9]\d{7,9}$/
  return phoneRegex.test(value.replace(/\s|-/g, ''))
}

export function isValidUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

// Safe type assertion functions
export function assertNonEmptyString(value: unknown, fieldName?: string): NonEmptyString {
  if (!isNonEmptyString(value)) {
    throw new Error(`Expected non-empty string${fieldName ? ` for ${fieldName}` : ''}`)
  }
  return value
}

export function assertPositiveNumber(value: unknown, fieldName?: string): PositiveNumber {
  if (!isPositiveNumber(value)) {
    throw new Error(`Expected positive number${fieldName ? ` for ${fieldName}` : ''}`)
  }
  return value
}

export function assertValidEmail(value: unknown, fieldName?: string): EmailAddress {
  if (!isValidEmail(value)) {
    throw new Error(`Expected valid email address${fieldName ? ` for ${fieldName}` : ''}`)
  }
  return value
}

export function assertValidUUID(value: unknown, fieldName?: string): UUID {
  if (!isValidUUID(value)) {
    throw new Error(`Expected valid UUID${fieldName ? ` for ${fieldName}` : ''}`)
  }
  return value
}

// Utility for exhaustive switch cases
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

// Safe object property access
export function safeGet<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (obj && typeof obj === 'object' && key in obj) {
    return obj[key]
  }
  return defaultValue
}

// Type-safe array operations
export function safeArrayAccess<T>(array: T[], index: number): T | undefined {
  if (index >= 0 && index < array.length) {
    return array[index]
  }
  return undefined
}

// Utility for checking if value is defined (not null or undefined)
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

// Utility for filtering out null/undefined values with proper typing
export function filterDefined<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(isDefined)
}

// Error handling types
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export function success<T>(data: T): Result<T> {
  return { success: true, data }
}

export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error }
}

// API Response types with strict validation
export interface ApiResponse<T = unknown> {
  data: T
  error?: string
  status: number
  timestamp: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Type-safe localStorage wrapper
export function safeLocalStorage() {
  const isClient = typeof window !== 'undefined'
  
  return {
    getItem<T>(key: string, defaultValue?: T): T | undefined {
      if (!isClient) return defaultValue
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch {
        return defaultValue
      }
    },
    
    setItem<T>(key: string, value: T): void {
      if (!isClient) return
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }
    },
    
    removeItem(key: string): void {
      if (!isClient) return
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error('Failed to remove from localStorage:', error)
      }
    }
  }
} 