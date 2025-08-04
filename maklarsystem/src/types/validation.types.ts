/**
 * Common validation types and utilities
 */

import { z } from 'zod'

// Validation error type
export interface ValidationError {
  path: string
  message: string
  code?: string
}

// Form validation state
export interface ValidationState {
  isValid: boolean
  errors: ValidationError[]
  isDirty: boolean
  isTouched: boolean
  isSubmitting: boolean
}

// Field validation state
export interface FieldValidationState {
  isValid: boolean
  error?: string
  isDirty: boolean
  isTouched: boolean
}

// Form field metadata
export interface FormField<T = any> {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'time'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options?: Array<{ value: T; label: string }>
  validation?: z.ZodType
  defaultValue?: T
  helpText?: string
  autoComplete?: string
}

// Form section
export interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  columns?: 1 | 2 | 3 | 4
  collapsible?: boolean
  defaultExpanded?: boolean
}

// Form configuration
export interface FormConfig {
  sections: FormSection[]
  submitLabel?: string
  cancelLabel?: string
  resetLabel?: string
  showReset?: boolean
  showCancel?: boolean
  confirmOnCancel?: boolean
  confirmOnReset?: boolean
}

// Validation result
export interface ValidationResult<T = any> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

// Async validation function type
export type AsyncValidator<T = any> = (
  value: T,
  context?: any
) => Promise<ValidationResult>

// Sync validation function type
export type SyncValidator<T = any> = (
  value: T,
  context?: any
) => ValidationResult

// Field change handler
export type FieldChangeHandler<T = any> = (
  name: string,
  value: T,
  shouldValidate?: boolean
) => void

// Form submit handler
export type FormSubmitHandler<T = any> = (
  data: T,
  formState: ValidationState
) => void | Promise<void>

// Validation mode
export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'all'

// Validation timing
export interface ValidationTiming {
  debounceMs?: number
  mode?: ValidationMode
  revalidateMode?: ValidationMode
}

// Common validation patterns
export const validationPatterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^(\+46|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{4}$/,
  postalCode: /^\d{3}\s?\d{2}$/,
  personnummer: /^(\d{6}|\d{8})[-\s]?\d{4}$/,
  organisationsnummer: /^\d{6}[-\s]?\d{4}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  date: /^\d{4}-\d{2}-\d{2}$/
}

// Validation helpers
export const validationHelpers = {
  // Check if value is empty
  isEmpty: (value: any): boolean => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  },

  // Check if value has minimum length
  hasMinLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  // Check if value has maximum length
  hasMaxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },

  // Check if value is within range
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },

  // Check if value matches pattern
  matchesPattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value)
  },

  // Format validation errors for display
  formatErrors: (errors: z.ZodError): ValidationError[] => {
    return errors.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message,
      code: error.code
    }))
  },

  // Get field error from validation state
  getFieldError: (fieldName: string, errors: ValidationError[]): string | undefined => {
    const error = errors.find(e => e.path === fieldName)
    return error?.message
  }
}

// Type guard for Zod error
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

// Type guard for validation error
export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'path' in error &&
    'message' in error
  )
}

// Extract form data type from schema
export type InferFormData<T extends z.ZodType> = z.infer<T>

// Create type-safe form field
export function createFormField<T>(field: FormField<T>): FormField<T> {
  return field
}

// Create type-safe form section
export function createFormSection(section: FormSection): FormSection {
  return section
}

// Create type-safe form config
export function createFormConfig(config: FormConfig): FormConfig {
  return config
}