/**
 * Message resolution system for i18n support
 * Handles parameter substitution and locale-based message loading
 */

import { LRUCache } from 'lru-cache'

// Cache for compiled messages
const messageCache = new LRUCache<string, string>({
  max: 1000, // Max 1000 messages
  ttl: 1000 * 60 * 60, // 1 hour TTL
})

// Cache for loaded locale files
const localeCache = new Map<string, Promise<Record<string, any>>>()

/**
 * Deep get value from nested object using dot notation
 */
function deepGet(obj: Record<string, any>, path: string): any {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current?.[key] === undefined) {
      return undefined
    }
    current = current[key]
  }
  
  return current
}

/**
 * Load messages for a specific locale
 */
export async function loadLocaleMessages(
  locale: string
): Promise<Record<string, any>> {
  // Return cached promise if it exists
  if (localeCache.has(locale)) {
    return localeCache.get(locale)!
  }

  // Load messages based on locale
  const promise = (async () => {
    switch (locale) {
      case 'sv':
        const svModule = await import('./sv/index')
        return svModule.messages
      case 'en':
        const enModule = await import('./en/index')
        return enModule.messages
      default:
        console.warn(`Locale '${locale}' not found, falling back to 'sv'`)
        const fallbackModule = await import('./sv/index')
        return fallbackModule.messages
    }
  })()

  localeCache.set(locale, promise)
  return promise
}

/**
 * Format a number based on locale
 */
function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : locale).format(value)
}

/**
 * Format a date based on locale
 */
function formatDate(value: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : locale).format(value)
}

/**
 * Substitute parameters in message template
 */
function substituteParams(
  template: string,
  params: Record<string, any>,
  locale: string
): string {
  return template.replace(/\{(\w+)\}/g, (match, param) => {
    const value = params[param]
    
    if (value === undefined) {
      return match
    }
    
    // Format based on type
    if (typeof value === 'number') {
      return formatNumber(value, locale)
    }
    
    if (value instanceof Date) {
      return formatDate(value, locale)
    }
    
    if (typeof value === 'boolean') {
      return value ? 'ja' : 'nej'
    }
    
    return String(value)
  })
}

/**
 * Resolve a message by key with parameter substitution
 */
export async function resolveMessage(
  key: string,
  params?: Record<string, any>,
  locale: string = 'sv'
): Promise<string> {
  // Create cache key
  const cacheKey = `${locale}:${key}:${JSON.stringify(params || {})}`
  
  // Check cache first
  const cached = messageCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Load messages for locale
  const messages = await loadLocaleMessages(locale)
  
  // Get message template
  let template = deepGet(messages, key)
  
  // Try fallback locale if not found
  if (!template && locale !== 'sv') {
    const fallbackMessages = await loadLocaleMessages('sv')
    template = deepGet(fallbackMessages, key)
  }
  
  // Use fallback or key if still not found
  if (!template) {
    template = params?.fallback || key
  }

  // Substitute parameters if needed
  let message = template
  if (params && typeof template === 'string') {
    message = substituteParams(template, params, locale)
  }

  // Cache the result
  messageCache.set(cacheKey, message)
  
  return message
}

/**
 * Synchronous version using preloaded messages
 */
export function resolveMessageSync(
  key: string,
  params?: Record<string, any>,
  messages?: Record<string, any>
): string {
  if (!messages) {
    // Try to use default Swedish messages
    try {
      messages = require('./sv/index').messages
    } catch {
      return params?.fallback || key
    }
  }

  if (!messages) {
    return params?.fallback || key
  }

  const template = deepGet(messages, key)
  
  if (!template) {
    return params?.fallback || key
  }

  if (params && typeof template === 'string') {
    return substituteParams(template, params, 'sv')
  }

  return template
}

/**
 * Batch resolve multiple messages
 */
export async function resolveMessages(
  entries: Array<{
    key: string
    params?: Record<string, any>
  }>,
  locale: string = 'sv'
): Promise<Record<string, string>> {
  const results = await Promise.all(
    entries.map(async ({ key, params }) => ({
      key,
      message: await resolveMessage(key, params, locale)
    }))
  )

  return results.reduce((acc, { key, message }) => {
    acc[key] = message
    return acc
  }, {} as Record<string, string>)
}