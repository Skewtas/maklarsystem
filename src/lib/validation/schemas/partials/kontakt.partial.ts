/**
 * Partial schemas för kontakt-entiteter för återanvändning
 */

import { z } from 'zod'
import { KONTAKT_TYP_VALUES, KONTAKT_KATEGORI_VALUES } from '../../../enums'
import {
  nonEmptyStringSchema,
  emailSchema,
  svensktTelefonnummerSchema,
  svensktPostnummerSchema
} from '../common.schema'

// Kontakt typ schema
export const kontaktTypPartialSchema = z.enum(KONTAKT_TYP_VALUES, {
  errorMap: () => ({ message: 'Ogiltig kontakttyp' })
})

// Kontakt kategori schema
export const kontaktKategoriPartialSchema = z.enum(KONTAKT_KATEGORI_VALUES, {
  errorMap: () => ({ message: 'Ogiltig kontaktkategori' })
})

// Bas kontaktfält som är gemensamma för alla kontakttyper
export const baseKontaktPartialSchema = z.object({
  typ: kontaktTypPartialSchema,
  kategori: kontaktKategoriPartialSchema.default('ovrig'),
  email: emailSchema.optional().nullable(),
  telefon: svensktTelefonnummerSchema.optional().nullable(),
  mobil: svensktTelefonnummerSchema.optional().nullable(),
  adress: z.string().optional().nullable(),
  postnummer: svensktPostnummerSchema.optional().nullable(),
  ort: z.string().optional().nullable()
})

// Privatperson-specifika fält
export const privatpersonPartialSchema = z.object({
  fornamn: nonEmptyStringSchema,
  efternamn: nonEmptyStringSchema,
  personnummer: z.string().optional().nullable()
})

// Företag-specifika fält
export const foretagPartialSchema = z.object({
  foretag: nonEmptyStringSchema,
  organisationsnummer: z.string().optional().nullable(),
  fornamn: z.string().optional().nullable(), // Kontaktperson
  efternamn: z.string().optional().nullable() // Kontaktperson
})

// Update-specifika partial schemas
export const kontaktUpdatePartialSchema = z.object({
  typ: kontaktTypPartialSchema.optional(),
  kategori: kontaktKategoriPartialSchema.optional(),
  fornamn: z.string().optional().nullable(),
  efternamn: z.string().optional().nullable(),
  foretag: z.string().optional().nullable(),
  email: emailSchema.optional().nullable(),
  telefon: svensktTelefonnummerSchema.optional().nullable(),
  mobil: svensktTelefonnummerSchema.optional().nullable(),
  adress: z.string().optional().nullable(),
  postnummer: svensktPostnummerSchema.optional().nullable(),
  ort: z.string().optional().nullable(),
  personnummer: z.string().optional().nullable(),
  organisationsnummer: z.string().optional().nullable()
})

// Filter partial schema
export const kontaktFilterPartialSchema = z.object({
  typ: z.union([kontaktTypPartialSchema, z.literal('alla')]).optional(),
  kategori: z.union([kontaktKategoriPartialSchema, z.literal('alla')]).optional(),
  search: z.string().optional() // Sök i namn, email, telefon
})