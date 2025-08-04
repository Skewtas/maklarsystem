/**
 * Example: Using validation middleware in Pages Router
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { validatePages } from '../validate'
import { kontaktCreateSchema } from '@/lib/validation/schemas/kontakt.schema'

// Example 1: Simple validation
const createKontaktValidation = validatePages({
  body: kontaktCreateSchema
})

export default createKontaktValidation(
  async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Body is already validated and typed
    const body = req.body // Type is inferred from schema

    try {
      // Create contact in database
      const contact = await createContact(body)
      
      res.status(201).json({
        success: true,
        data: contact
      })
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to create contact',
          code: 'CREATE_FAILED'
        }
      })
    }
  }
)

// Example 2: Multiple HTTP methods
const kontaktByIdSchema = z.object({
  id: z.string().uuid()
})

const kontaktHandlerValidation = validatePages({
  query: kontaktByIdSchema,
  body: z.union([
    kontaktCreateSchema.partial(), // For PATCH
    z.undefined() // For GET/DELETE
  ])
})

export const kontaktByIdHandler = kontaktHandlerValidation(
  async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string }

    switch (req.method) {
      case 'GET':
        const contact = await getContact(id)
        if (!contact) {
          return res.status(404).json({
            error: { message: 'Kontakt hittades inte' }
          })
        }
        return res.json({ success: true, data: contact })

      case 'PATCH':
        const updated = await updateContact(id, req.body)
        return res.json({ success: true, data: updated })

      case 'DELETE':
        await deleteContact(id)
        return res.status(204).end()

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
        return res.status(405).json({
          error: { message: 'Method not allowed' }
        })
    }
  }
)

// Example 3: Search with query validation
const searchSchema = z.object({
  q: z.string().optional(),
  typ: z.enum(['privatperson', 'foretag']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['namn', 'skapad', 'uppdaterad']).default('namn'),
  order: z.enum(['asc', 'desc']).default('asc')
})

export const searchHandler = validatePages({
  query: searchSchema
})(
  async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET'])
      return res.status(405).json({
        error: { message: 'Method not allowed' }
      })
    }

    // Query is validated and has defaults applied
    const query = req.query as z.infer<typeof searchSchema>
    
    const results = await searchContacts(query)
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: results.length
      }
    })
  }
)

// Example 4: With custom error handling
const customValidation = validatePages(
  {
    body: kontaktCreateSchema
  },
  {
    onError: (error) => {
      // Log to monitoring service
      console.error('Validation error:', error.toJSON())
    },
    stripUnknown: false // Strict mode - reject unknown fields
  }
)

// Placeholder functions
async function createContact(data: any) {
  return { id: '123', ...data }
}

async function getContact(id: string) {
  return { id, namn: 'Test' }
}

async function updateContact(id: string, data: any) {
  return { id, ...data }
}

async function deleteContact(id: string) {
  return true
}

async function searchContacts(params: any) {
  return []
}