/**
 * Validation schemas for contact (kontakter) entities
 */

import { z } from 'zod'
import { personnummerValidator, organisationsnummerValidator } from '../validators/swedish.validators'
import {
  kontaktTypPartialSchema,
  kontaktKategoriPartialSchema,
  baseKontaktPartialSchema,
  privatpersonPartialSchema,
  foretagPartialSchema,
  kontaktUpdatePartialSchema,
  kontaktFilterPartialSchema
} from './partials/kontakt.partial'

// Re-export för bakåtkompatibilitet
export const kontaktTypSchema = kontaktTypPartialSchema
export const kontaktKategoriSchema = kontaktKategoriPartialSchema

// Private person schema
export const privatpersonSchema = baseKontaktPartialSchema.extend({
  typ: z.literal('privatperson'),
  ...privatpersonPartialSchema.shape,
  personnummer: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || personnummerValidator(val),
      'Ogiltigt personnummer'
    ),
  foretag: z.never().optional(),
  organisationsnummer: z.never().optional()
})

// Company schema
export const foretagSchema = baseKontaktPartialSchema.extend({
  typ: z.literal('foretag'),
  ...foretagPartialSchema.shape,
  organisationsnummer: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || organisationsnummerValidator(val),
      'Ogiltigt organisationsnummer'
    ),
  personnummer: z.never().optional()
})

// Create schema with discriminated union
export const kontaktCreateSchema = z.discriminatedUnion('typ', [
  privatpersonSchema,
  foretagSchema
])

// Update schema (använder partial schema)
export const kontaktUpdateSchema = kontaktUpdatePartialSchema

// Search/filter schema (använder partial schema)
export const kontaktFilterSchema = kontaktFilterPartialSchema

// Type exports
export type KontaktCreate = z.infer<typeof kontaktCreateSchema>
export type KontaktUpdate = z.infer<typeof kontaktUpdateSchema>
export type KontaktFilter = z.infer<typeof kontaktFilterSchema>
export type Privatperson = z.infer<typeof privatpersonSchema>
export type Foretag = z.infer<typeof foretagSchema>