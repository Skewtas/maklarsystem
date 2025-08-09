/**
 * Validation schemas for bidding (bud) entities
 */

import { z } from 'zod'
import { dateSchema, priceSchema } from './common.schema'

// Bid status enum
export const budStatusSchema = z.enum(['aktivt', 'accepterat', 'avslaget', 'tillbakadraget'], {
  errorMap: () => ({ message: 'Ogiltig budstatus' })
})

// Time validation (HH:MM:SS format)
export const timeWithSecondsSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Ogiltig tid (HH:MM:SS)')
  .or(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid (HH:MM)'))
  .transform(val => {
    // Add seconds if not provided
    return val.split(':').length === 2 ? `${val}:00` : val
  })

// Create schema
export const budCreateSchema = z.object({
  objekt_id: z.string().uuid('Ogiltigt objekt-ID'),
  spekulant_id: z.string().uuid('Ogiltigt spekulant-ID'),
  belopp: priceSchema.refine(
    val => val >= 1000,
    'Bud måste vara minst 1000 kr'
  ),
  datum: dateSchema.default(() => new Date()),
  tid: timeWithSecondsSchema.default(() => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  }),
  status: budStatusSchema.default('aktivt')
})

// Update schema (typically only status can be updated)
export const budUpdateSchema = z.object({
  status: budStatusSchema
})

// Filter schema
export const budFilterSchema = z.object({
  objekt_id: z.string().uuid().optional(),
  spekulant_id: z.string().uuid().optional(),
  status: budStatusSchema.optional(),
  minBelopp: priceSchema.optional(),
  maxBelopp: priceSchema.optional(),
  fromDate: dateSchema.optional(),
  toDate: dateSchema.optional()
})

// Bid acceptance schema
export const budAcceptanceSchema = z.object({
  bud_id: z.string().uuid('Ogiltigt bud-ID'),
  slutpris: priceSchema.optional() // Final price might differ from bid
})

// Bid history schema (for tracking all bids on an object)
export const budHistorySchema = z.object({
  objekt_id: z.string().uuid('Ogiltigt objekt-ID'),
  includeWithdrawn: z.boolean().default(false),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Type exports
export type BudCreate = z.infer<typeof budCreateSchema>
export type BudUpdate = z.infer<typeof budUpdateSchema>
export type BudFilter = z.infer<typeof budFilterSchema>
export type BudAcceptance = z.infer<typeof budAcceptanceSchema>
export type BudHistory = z.infer<typeof budHistorySchema>