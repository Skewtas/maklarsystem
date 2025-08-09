/**
 * Central validation exports and utilities
 */

import { z } from 'zod'

// Re-export all schemas
export * from './schemas/objekt.schema'
export * from './schemas/kontakter.schema'
export * from './schemas/visningar.schema'
export * from './schemas/bud.schema'
export * from './schemas/common.schema'

// Re-export all validators
export * from './validators/swedish.validators'
export * from './validators/property.validators'
export * from './validators/financial.validators'

// Common validation utilities
export const parseZodError = (error: z.ZodError) => {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }))
}

export const isValidationError = (error: unknown): error is z.ZodError => {
  return error instanceof z.ZodError
}

// Type helper for inferred types
export type InferSchema<T extends z.ZodType> = z.infer<T>