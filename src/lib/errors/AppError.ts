/**
 * Application-wide error class for consistent error handling
 * Supports structured error responses and i18n message resolution
 */

import { ZodError } from 'zod'
import { NextResponse } from 'next/server'

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'UNPROCESSABLE_ENTITY'

export interface FormattedError {
  field: string
  message: string
  code?: string
  params?: Record<string, any>
}

export interface AppErrorOptions {
  statusCode?: number
  code?: ErrorCode
  details?: FormattedError[]
  params?: Record<string, any>
  cause?: Error
  requestId?: string
  timestamp?: Date
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: ErrorCode
  public readonly details: FormattedError[]
  public readonly params?: Record<string, any>
  public readonly cause?: Error
  public readonly requestId?: string
  public readonly timestamp: Date

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    
    this.statusCode = options.statusCode || 500
    this.code = options.code || 'INTERNAL_SERVER_ERROR'
    this.details = options.details || []
    this.params = options.params
    this.cause = options.cause
    this.requestId = options.requestId || crypto.randomUUID()
    this.timestamp = options.timestamp || new Date()

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * Create validation error from Zod error
   */
  static fromZodError(error: ZodError, requestId?: string): AppError {
    const details: FormattedError[] = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      params: {
        ...err,
        path: undefined,
        message: undefined,
        code: undefined
      }
    }))

    return new AppError('Valideringsfel', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details,
      cause: error,
      requestId
    })
  }

  /**
   * Convert to HTTP response
   */
  toResponse(): NextResponse {
    const body = {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        requestId: this.requestId,
        timestamp: this.timestamp.toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          cause: this.cause?.message
        })
      },
      ...(this.details.length > 0 && { errors: this.details })
    }

    const headers = new Headers()
    if (this.requestId) {
      headers.set('X-Request-Id', this.requestId)
    }
    
    return NextResponse.json(body, { 
      status: this.statusCode,
      headers
    })
  }

  /**
   * Convert to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      params: this.params,
      requestId: this.requestId,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause?.message
    }
  }
}

/**
 * Predefined error factories
 */
export const AppErrors = {
  validation: (message: string, details: FormattedError[], requestId?: string) =>
    new AppError(message, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details,
      requestId
    }),

  unauthorized: (message = 'Ej behörig', requestId?: string) =>
    new AppError(message, {
      statusCode: 401,
      code: 'AUTHENTICATION_ERROR',
      requestId
    }),

  forbidden: (message = 'Åtkomst nekad', requestId?: string) =>
    new AppError(message, {
      statusCode: 403,
      code: 'AUTHORIZATION_ERROR',
      requestId
    }),

  notFound: (resource: string, requestId?: string) =>
    new AppError(`${resource} hittades inte`, {
      statusCode: 404,
      code: 'NOT_FOUND',
      requestId
    }),

  conflict: (message: string, requestId?: string) =>
    new AppError(message, {
      statusCode: 409,
      code: 'CONFLICT',
      requestId
    }),

  rateLimit: (retryAfter?: number, requestId?: string) =>
    new AppError('För många förfrågningar', {
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      params: { retryAfter },
      requestId
    }),

  internal: (message = 'Ett oväntat fel uppstod', cause?: Error, requestId?: string) =>
    new AppError(message, {
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      cause,
      requestId
    })
}