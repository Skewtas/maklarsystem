/**
 * Validation middleware for Next.js API routes
 * Supports both Pages Router and App Router
 */

import { NextRequest, NextResponse } from 'next/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { z, ZodError, ZodSchema } from 'zod'
import { AppError } from '@/lib/errors/AppError'
import { formatZodErrors, formatZodErrorsSync } from '@/lib/validation/formatters/formatZodErrors'
import { sanitizeFormData, SanitizationProfile } from '@/lib/security/sanitizer'

/**
 * Validation schemas configuration
 */
export interface ValidationSchemas {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
  headers?: ZodSchema
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /**
   * Whether to use async message resolution
   * @default true
   */
  async?: boolean
  
  /**
   * Whether to strip unknown properties
   * @default true
   */
  stripUnknown?: boolean
  
  /**
   * Custom error handler
   */
  onError?: (error: AppError) => void
  
  /**
   * Request ID generator
   */
  getRequestId?: (req: NextRequest | NextApiRequest) => string
  
  /**
   * Sanitization options
   */
  sanitization?: {
    /**
     * Whether to enable sanitization
     * @default true
     */
    enabled?: boolean
    
    /**
     * Sanitization profile to use
     * @default 'moderate'
     */
    profile?: SanitizationProfile
  }
}

/**
 * Default request ID generator
 */
function defaultGetRequestId(req: NextRequest | NextApiRequest): string {
  if ('headers' in req && req.headers instanceof Headers) {
    return req.headers.get('x-request-id') || crypto.randomUUID()
  }
  return (req as NextApiRequest).headers['x-request-id'] as string || crypto.randomUUID()
}

/**
 * Validate data against schema
 */
async function validateData(
  data: unknown,
  schema: ZodSchema,
  options: ValidationOptions,
  requestId: string,
  shouldSanitize: boolean = false
): Promise<any> {
  try {
    // Sanitize data if enabled and applicable
    let processedData = data
    if (shouldSanitize && options.sanitization?.enabled !== false && data && typeof data === 'object') {
      processedData = sanitizeFormData(
        data as Record<string, any>,
        options.sanitization?.profile || 'moderate'
      )
    }
    
    return schema.parse(processedData)
  } catch (error) {
    if (error instanceof ZodError) {
      const details = options.async
        ? await formatZodErrors(error)
        : formatZodErrorsSync(error)
      
      const appError = new AppError('Valideringsfel', {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details,
        cause: error,
        requestId
      })
      
      if (options.onError) {
        options.onError(appError)
      }
      
      throw appError
    }
    throw error
  }
}

/**
 * Validation middleware for App Router
 */
export function validateApp(
  schemas: ValidationSchemas,
  options: ValidationOptions = {}
) {
  const opts: ValidationOptions = {
    async: true,
    stripUnknown: true,
    getRequestId: defaultGetRequestId,
    ...options
  }

  return async function middleware(
    req: NextRequest,
    params?: Record<string, any>
  ): Promise<NextResponse | void> {
    const requestId = opts.getRequestId!(req)
    
    try {
      // Validate headers
      if (schemas.headers) {
        const headers = Object.fromEntries(req.headers.entries())
        await validateData(headers, schemas.headers, opts, requestId, false) // Don't sanitize headers
      }

      // Validate query parameters
      if (schemas.query) {
        const query = Object.fromEntries(req.nextUrl.searchParams.entries())
        await validateData(query, schemas.query, opts, requestId, true) // Sanitize query params
      }

      // Validate route params
      if (schemas.params && params) {
        await validateData(params, schemas.params, opts, requestId, true) // Sanitize route params
      }

      // Validate body
      if (schemas.body && req.method !== 'GET' && req.method !== 'HEAD') {
        const contentType = req.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          try {
            const body = await req.json()
            const validated = await validateData(body, schemas.body, opts, requestId, true); // Sanitize body
            
            // Attach validated data to the request
            (req as any).validatedBody = validated
            
            // Return void to continue with the request
            return
          } catch (error) {
            if (error instanceof AppError) {
              return error.toResponse()
            }
            throw error
          }
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        return error.toResponse()
      }
      
      const appError = new AppError('Ett oväntat fel uppstod', {
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        cause: error as Error,
        requestId
      })
      
      return appError.toResponse()
    }
  }
}

/**
 * Validation middleware for Pages Router
 */
export function validatePages(
  schemas: ValidationSchemas,
  options: ValidationOptions = {}
) {
  const opts: ValidationOptions = {
    async: true,
    stripUnknown: true,
    getRequestId: defaultGetRequestId,
    ...options
  }

  return function middleware(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
  ) {
    return async function wrappedHandler(
      req: NextApiRequest,
      res: NextApiResponse
    ): Promise<void> {
      const requestId = opts.getRequestId!(req)
      
      try {
        // Validate headers
        if (schemas.headers) {
          await validateData(req.headers, schemas.headers, opts, requestId, false) // Don't sanitize headers
        }

        // Validate query
        if (schemas.query) {
          req.query = await validateData(req.query, schemas.query, opts, requestId, true) // Sanitize query params
        }

        // Validate body
        if (schemas.body && req.method !== 'GET' && req.method !== 'HEAD') {
          req.body = await validateData(req.body, schemas.body, opts, requestId, true) // Sanitize body
        }

        // Call the handler
        await handler(req, res)
      } catch (error) {
        if (error instanceof AppError) {
          const response = error.toResponse()
          const body = await response.json()
          
          res.status(error.statusCode)
          res.setHeader('X-Request-Id', requestId)
          res.json(body)
        } else {
          const appError = new AppError('Ett oväntat fel uppstod', {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            cause: error as Error,
            requestId
          })
          
          res.status(500)
          res.setHeader('X-Request-Id', requestId)
          res.json({
            error: {
              message: appError.message,
              code: appError.code,
              requestId
            }
          })
        }
      }
    }
  }
}

/**
 * Helper to create validation middleware with schemas
 */
export function createValidation(schemas: ValidationSchemas, options?: ValidationOptions) {
  return {
    app: validateApp(schemas, options),
    pages: validatePages(schemas, options)
  }
}

/**
 * Type helpers for validated requests
 */
export type ValidatedAppRequest<
  Body = any,
  Query = any,
  Params = any
> = NextRequest & {
  validatedBody?: Body
  validatedQuery?: Query
  validatedParams?: Params
}

export type ValidatedPagesRequest<
  Body = any,
  Query = any
> = NextApiRequest & {
  body: Body
  query: Query
}