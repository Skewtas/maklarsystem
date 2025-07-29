/**
 * Environment Variables Configuration and Validation
 * 
 * This module provides type-safe access to environment variables
 * and validates required variables are present.
 */

interface Environment {
  // Supabase Configuration (Required)
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string

  // Next.js Configuration
  NODE_ENV: 'development' | 'production' | 'test'
  NEXTAUTH_URL?: string
  NEXTAUTH_SECRET?: string

  // Application Settings
  APP_NAME?: string
  APP_URL?: string

  // Database URLs
  DATABASE_URL?: string

  // Email Configuration
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  SMTP_FROM?: string

  // External API Keys
  VITEC_API_KEY?: string
  HEMNET_API_KEY?: string

  // File Upload Configuration
  MAX_FILE_SIZE?: string
  ALLOWED_FILE_TYPES?: string

  // Security
  BCRYPT_ROUNDS?: string
  JWT_SECRET?: string

  // Analytics & Monitoring
  GOOGLE_ANALYTICS_ID?: string
  HOTJAR_ID?: string
  SENTRY_DSN?: string
}

/**
 * Get environment variable with type safety
 */
function getEnvVar(key: keyof Environment, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: keyof Environment, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const requiredVars: (keyof Environment)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See ENVIRONMENT_SETUP.md for more information.'
    )
  }
}

/**
 * Environment configuration object with type safety
 */
export const env = {
  // Required Supabase configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  // Environment
  NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // Next.js
  NEXTAUTH_URL: getOptionalEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),
  NEXTAUTH_SECRET: getOptionalEnvVar('NEXTAUTH_SECRET'),

  // Application
  APP_NAME: getOptionalEnvVar('APP_NAME', 'Mäklarsystem'),
  APP_URL: getOptionalEnvVar('APP_URL', 'http://localhost:3000'),

  // Database
  DATABASE_URL: getOptionalEnvVar('DATABASE_URL'),

  // Email
  SMTP: {
    HOST: getOptionalEnvVar('SMTP_HOST'),
    PORT: parseInt(getOptionalEnvVar('SMTP_PORT', '587') || '587', 10),
    USER: getOptionalEnvVar('SMTP_USER'),
    PASS: getOptionalEnvVar('SMTP_PASS'),
    FROM: getOptionalEnvVar('SMTP_FROM', 'noreply@bergets-ro.se'),
  },

  // External APIs
  VITEC_API_KEY: getOptionalEnvVar('VITEC_API_KEY'),
  HEMNET_API_KEY: getOptionalEnvVar('HEMNET_API_KEY'),

  // File Upload
  MAX_FILE_SIZE: parseInt(getOptionalEnvVar('MAX_FILE_SIZE', '10485760') || '10485760', 10), // 10MB
  ALLOWED_FILE_TYPES: (getOptionalEnvVar('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,pdf,doc,docx') || 'jpg,jpeg,png,pdf,doc,docx')
    .split(',')
    .map(type => type.trim()),

  // Security
  BCRYPT_ROUNDS: parseInt(getOptionalEnvVar('BCRYPT_ROUNDS', '12') || '12', 10),
  JWT_SECRET: getOptionalEnvVar('JWT_SECRET'),

  // Analytics & Monitoring
  GOOGLE_ANALYTICS_ID: getOptionalEnvVar('GOOGLE_ANALYTICS_ID'),
  HOTJAR_ID: getOptionalEnvVar('HOTJAR_ID'),
  SENTRY_DSN: getOptionalEnvVar('SENTRY_DSN'),
} as const

/**
 * Development helper to log environment status
 */
export function logEnvironmentStatus(): void {
  if (env.IS_DEVELOPMENT) {
    console.log('🌍 Environment Status:', {
      NODE_ENV: env.NODE_ENV,
      APP_NAME: env.APP_NAME,
      SUPABASE_CONFIGURED: !!env.SUPABASE_URL,
      EMAIL_CONFIGURED: !!env.SMTP.HOST,
      ANALYTICS_CONFIGURED: !!env.GOOGLE_ANALYTICS_ID,
    })
  }
}

// Validate environment on module load
try {
  validateEnvironment()
} catch (error) {
  if (env.IS_DEVELOPMENT) {
    console.warn('⚠️ Environment validation warning:', (error as Error).message)
  }
} 