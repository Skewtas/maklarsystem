/**
 * Validation schemas for property viewing (visningar) entities
 */

import { z } from 'zod'
import { dateSchema } from './common.schema'

// Viewing type enum
export const visningTypSchema = z.enum(['oppen', 'privat', 'digital'], {
  errorMap: () => ({ message: 'Ogiltig visningstyp' })
})

// Time validation (HH:MM format)
export const timeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid (HH:MM)')

// Base schema without refinements
const visningBaseSchema = z.object({
  objekt_id: z.string().uuid('Ogiltigt objekt-ID'),
  datum: dateSchema,
  starttid: timeSchema,
  sluttid: timeSchema,
  typ: visningTypSchema.default('oppen'),
  antal_besokare: z.number().int().min(0).optional().nullable()
})

// Create schema with time validation
export const visningCreateSchema = visningBaseSchema.refine(
  (data) => {
    // Validate that end time is after start time
    const [startHour, startMin] = data.starttid.split(':').map(Number)
    const [endHour, endMin] = data.sluttid.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes > startMinutes
  },
  {
    message: 'Sluttid måste vara efter starttid',
    path: ['sluttid']
  }
)

// Update schema (all fields optional)
export const visningUpdateSchema = visningBaseSchema.partial()

// Filter schema
export const visningFilterSchema = z.object({
  objekt_id: z.string().uuid().optional(),
  typ: visningTypSchema.optional(),
  fromDate: dateSchema.optional(),
  toDate: dateSchema.optional(),
  upcoming: z.boolean().optional() // Show only future viewings
})

// Bulk create schema (for creating multiple viewings)
export const visningBulkCreateSchema = z.object({
  objekt_id: z.string().uuid('Ogiltigt objekt-ID'),
  visningar: z.array(z.object({
    datum: dateSchema,
    starttid: timeSchema,
    sluttid: timeSchema,
    typ: visningTypSchema.default('oppen')
  })).min(1, 'Minst en visning krävs')
})

// Type exports
export type VisningCreate = z.infer<typeof visningCreateSchema>
export type VisningUpdate = z.infer<typeof visningUpdateSchema>
export type VisningFilter = z.infer<typeof visningFilterSchema>
export type VisningBulkCreate = z.infer<typeof visningBulkCreateSchema>