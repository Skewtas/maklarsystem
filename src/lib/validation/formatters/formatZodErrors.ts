/**
 * Zod error formatter for consistent error responses
 * Converts Zod validation errors to structured format with i18n support
 */

import { ZodError, ZodIssue } from 'zod'
import { FormattedError } from '@/lib/errors/AppError'
import { resolveMessage } from '@/lib/validation/messages/resolveMessage'

/**
 * Map Zod error codes to message keys
 */
const zodCodeToMessageKey: Record<string, string> = {
  invalid_type: 'validation.invalid_type',
  invalid_literal: 'validation.invalid_literal',
  custom: 'validation.custom',
  invalid_union: 'validation.invalid_union',
  invalid_union_discriminator: 'validation.invalid_union_discriminator',
  invalid_enum_value: 'validation.invalid_enum_value',
  unrecognized_keys: 'validation.unrecognized_keys',
  invalid_arguments: 'validation.invalid_arguments',
  invalid_return_type: 'validation.invalid_return_type',
  invalid_date: 'validation.invalid_date',
  invalid_string: 'validation.invalid_string',
  too_small: 'validation.too_small',
  too_big: 'validation.too_big',
  invalid_intersection_types: 'validation.invalid_intersection_types',
  not_multiple_of: 'validation.not_multiple_of',
  not_finite: 'validation.not_finite',
}

/**
 * Extract field name from path
 */
function getFieldName(path: (string | number)[]): string {
  return path
    .map(segment => {
      if (typeof segment === 'number') {
        return `[${segment}]`
      }
      return segment
    })
    .join('.')
}

/**
 * Get human-readable field label
 */
function getFieldLabel(fieldName: string): string {
  // Map common field names to Swedish labels
  const fieldLabels: Record<string, string> = {
    fornamn: 'Förnamn',
    efternamn: 'Efternamn',
    epost: 'E-postadress',
    telefon: 'Telefonnummer',
    personnummer: 'Personnummer',
    organisationsnummer: 'Organisationsnummer',
    adress: 'Adress',
    postnummer: 'Postnummer',
    ort: 'Ort',
    typ: 'Typ',
    status: 'Status',
    pris: 'Pris',
    boarea: 'Boarea',
    rum: 'Antal rum',
    byggaar: 'Byggår',
    fastighetsbeteckning: 'Fastighetsbeteckning',
  }

  // Handle nested fields
  const parts = fieldName.split('.')
  const lastPart = parts[parts.length - 1]
  
  return fieldLabels[lastPart] || fieldName
}

/**
 * Format a single Zod issue
 */
async function formatZodIssue(issue: ZodIssue): Promise<FormattedError> {
  const field = getFieldName(issue.path)
  const fieldLabel = getFieldLabel(field)
  
  // Get message key based on error code
  const messageKey = zodCodeToMessageKey[issue.code] || 'validation.invalid'
  
  // Build params for message resolution
  const params: Record<string, any> = {
    field: fieldLabel,
    ...issue,
    path: undefined,
    message: undefined,
  }

  // Add specific params based on error type
  switch (issue.code) {
    case 'too_small':
      params.min = issue.minimum
      params.type = issue.type
      break
    case 'too_big':
      params.max = issue.maximum
      params.type = issue.type
      break
    case 'invalid_enum_value':
      params.options = issue.options.join(', ')
      params.received = issue.received
      break
    case 'invalid_type':
      params.expected = issue.expected
      params.received = issue.received
      break
  }

  // Try to resolve message, fallback to Zod's message if not found
  let message: string
  try {
    message = await resolveMessage(messageKey, params)
  } catch {
    // Fallback to Zod's default message or a generic one
    message = issue.message || `${fieldLabel} är ogiltigt`
  }

  return {
    field,
    message,
    code: issue.code,
    params: params
  }
}

/**
 * Format Zod validation errors
 */
export async function formatZodErrors(
  error: ZodError,
  options?: {
    includeParams?: boolean
    locale?: string
  }
): Promise<FormattedError[]> {
  const { includeParams = false } = options || {}
  
  // Format all issues in parallel
  const formattedErrors = await Promise.all(
    error.errors.map(issue => formatZodIssue(issue))
  )

  // Remove params if not requested
  if (!includeParams) {
    formattedErrors.forEach(err => {
      delete err.params
    })
  }

  // Sort by field path for consistent ordering
  return formattedErrors.sort((a, b) => a.field.localeCompare(b.field))
}

/**
 * Synchronous version using default messages
 */
export function formatZodErrorsSync(error: ZodError): FormattedError[] {
  return error.errors.map(issue => {
    const field = getFieldName(issue.path)
    const fieldLabel = getFieldLabel(field)
    
    return {
      field,
      message: issue.message || `${fieldLabel} är ogiltigt`,
      code: issue.code
    }
  }).sort((a, b) => a.field.localeCompare(b.field))
}

/**
 * Group errors by field for form display
 */
export function groupErrorsByField(
  errors: FormattedError[]
): Record<string, string[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = []
    }
    acc[error.field].push(error.message)
    return acc
  }, {} as Record<string, string[]>)
}

/**
 * Get first error for each field
 */
export function getFirstErrorByField(
  errors: FormattedError[]
): Record<string, string> {
  const grouped = groupErrorsByField(errors)
  return Object.entries(grouped).reduce((acc, [field, messages]) => {
    acc[field] = messages[0]
    return acc
  }, {} as Record<string, string>)
}