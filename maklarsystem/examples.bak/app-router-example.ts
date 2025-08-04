/**
 * Example: Using validation middleware in App Router
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateApp } from '../validate'
import { kontaktCreateSchema } from '@/lib/validation/schemas/kontakter.schema'

// Example 1: Simple validation
const createKontaktValidation = validateApp({
  body: kontaktCreateSchema
})

export async function POST(req: NextRequest) {
  // Apply validation
  const validationResult = await createKontaktValidation(req)
  
  // Check if validation failed
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  // Access validated data
  const validatedReq = validationResult || req
  const body = (validatedReq as any).validatedBody

  // Your business logic here
  try {
    // Create contact in database
    const contact = await createContact(body)
    
    return NextResponse.json({
      success: true,
      data: contact
    }, { status: 201 })
  } catch (error) {
    // Handle business logic errors
    return NextResponse.json({
      error: {
        message: 'Failed to create contact',
        code: 'CREATE_FAILED'
      }
    }, { status: 500 })
  }
}

// Example 2: Multiple validations
const searchSchema = z.object({
  q: z.string().optional(),
  typ: z.enum(['privatperson', 'foretag']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

const searchValidation = validateApp({
  query: searchSchema
})

export async function GET(req: NextRequest) {
  const validationResult = await searchValidation(req)
  
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  // Query params are validated and transformed
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
  
  // Your search logic here
  const results = await searchContacts(searchParams)
  
  return NextResponse.json({
    success: true,
    data: results,
    pagination: {
      page: searchParams.page,
      limit: searchParams.limit
    }
  })
}

// Example 3: With route params
const updateSchema = z.object({
  id: z.string().uuid()
})

const updateValidation = validateApp({
  params: updateSchema,
  body: kontaktCreateSchema.partial()
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const validationResult = await updateValidation(req, params)
  
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const body = (validationResult as any).validatedBody
  
  // Update logic
  const updated = await updateContact(params.id, body)
  
  return NextResponse.json({
    success: true,
    data: updated
  })
}

// Placeholder functions
async function createContact(data: any) {
  // Database logic
  return { id: '123', ...data }
}

async function searchContacts(params: any) {
  // Search logic
  return []
}

async function updateContact(id: string, data: any) {
  // Update logic
  return { id, ...data }
}