/**
 * Partial schemas för objekt-entiteter för återanvändning
 */

import { z } from 'zod'
import {
  OBJEKT_TYP_VALUES,
  OBJEKT_UNDERTYP_VALUES,
  AGARE_TYP_VALUES,
  AGANDEKATEGORI_VALUES,
  PRISTYP_VALUES,
  KOK_VALUES,
  BYGGMATERIAL_VALUES,
  UPPVARMNING_VALUES,
  VENTILATION_VALUES,
  ELNAT_VALUES,
  BREDBAND_VALUES
} from '../../../enums'
import {
  nonEmptyStringSchema,
  svensktPostnummerSchema,
  priceSchema,
  areaSchema,
  roomCountSchema,
  yearSchema,
  floorSchema,
  percentageSchema,
  statusSchema,
  energyClassSchema,
  standardNivaSchema,
  laddboxTypSchema,
  urlSchema,
  optionalPositiveNumberSchema,
  optionalDateSchema
} from '../common.schema'

// Objekt typ schemas
export const objektTypPartialSchema = z.enum(OBJEKT_TYP_VALUES, {
  errorMap: () => ({ message: 'Ogiltig objekttyp' })
})

export const objektUndertypPartialSchema = z.enum(OBJEKT_UNDERTYP_VALUES, {
  errorMap: () => ({ message: 'Ogiltig undertyp' })
}).optional().nullable()

// Ägarskap schemas
export const agareTypPartialSchema = z.enum(AGARE_TYP_VALUES, {
  errorMap: () => ({ message: 'Ogiltig ägartyp' })
}).optional().nullable()

export const agandekategoriPartialSchema = z.enum(AGANDEKATEGORI_VALUES, {
  errorMap: () => ({ message: 'Ogiltig ägandekategori' })
}).optional().nullable()

// Pris schemas
export const pristypPartialSchema = z.enum(PRISTYP_VALUES, {
  errorMap: () => ({ message: 'Ogiltig pristyp' })
}).optional().nullable()

// Kök schema
export const kokPartialSchema = z.enum(KOK_VALUES, {
  errorMap: () => ({ message: 'Ogiltig kökstyp' })
}).optional().nullable()

// Byggmaterial schema
export const byggmaterialPartialSchema = z.enum(BYGGMATERIAL_VALUES, {
  errorMap: () => ({ message: 'Ogiltigt byggmaterial' })
}).optional().nullable()

// Uppvärmning schema
export const uppvarmningPartialSchema = z.enum(UPPVARMNING_VALUES, {
  errorMap: () => ({ message: 'Ogiltig uppvärmningstyp' })
}).optional().nullable()

// Ventilation schema
export const ventilationPartialSchema = z.enum(VENTILATION_VALUES, {
  errorMap: () => ({ message: 'Ogiltig ventilationstyp' })
}).optional().nullable()

// Elnät schema
export const elnatPartialSchema = z.enum(ELNAT_VALUES, {
  errorMap: () => ({ message: 'Ogiltigt elnät' })
}).optional().nullable()

// Bredband schema
export const bredbandPartialSchema = z.enum(BREDBAND_VALUES, {
  errorMap: () => ({ message: 'Ogiltig bredbandtyp' })
}).optional().nullable()

// Grundläggande objekt fält
export const baseObjektPartialSchema = z.object({
  typ: objektTypPartialSchema,
  adress: nonEmptyStringSchema,
  postnummer: svensktPostnummerSchema,
  ort: nonEmptyStringSchema,
  kommun: nonEmptyStringSchema,
  lan: nonEmptyStringSchema,
  maklare_id: z.string().uuid('Ogiltig mäklar-ID')
})

// Valfria grundfält
export const optionalObjektPartialSchema = z.object({
  objektnummer: z.string().optional(),
  status: statusSchema.default('kundbearbetning'),
  utgangspris: priceSchema.optional().nullable(),
  slutpris: priceSchema.optional().nullable(),
  boarea: areaSchema.optional().nullable(),
  biarea: areaSchema.optional().nullable(),
  tomtarea: areaSchema.optional().nullable(),
  rum: roomCountSchema.optional().nullable(),
  byggaar: yearSchema.optional().nullable(),
  saljare_id: z.string().uuid().optional().nullable(),
  kopare_id: z.string().uuid().optional().nullable(),
  beskrivning: z.string().optional().nullable()
})

// Prioritet 1 - Essentiella fält
export const priority1ObjektPartialSchema = z.object({
  fastighetsbeteckning: z.string().optional().nullable(),
  undertyp: objektUndertypPartialSchema,
  andel_i_forening: percentageSchema.optional().nullable(),
  andelstal: z.number().optional().nullable(),
  virtuell_visning_url: urlSchema
})

// Prioritet 2 - Värdefulla fält
export const priority2ObjektPartialSchema = z.object({
  boendekalkyl_url: urlSchema,
  standard_niva: standardNivaSchema.optional().nullable(),
  tillganglighetsanpassad: z.boolean().optional().nullable(),
  laddbox: z.boolean().optional().nullable(),
  solceller: z.boolean().optional().nullable(),
  solceller_kapacitet_kwp: optionalPositiveNumberSchema,
  laddbox_typ: laddboxTypSchema.optional().nullable(),
  laddbox_antal: z.number().int().min(0).optional().nullable()
})

// Ägarskap och klassificering
export const ownershipObjektPartialSchema = z.object({
  agare_id: z.string().uuid().optional().nullable(),
  agare_typ: agareTypPartialSchema,
  agandekategori: agandekategoriPartialSchema
})

// Utökad prissättning och budgivning
export const pricingObjektPartialSchema = z.object({
  accepterat_pris: priceSchema.optional().nullable(),
  budgivning: z.boolean().optional().nullable(),
  budgivningsdatum: optionalDateSchema,
  pristyp: pristypPartialSchema,
  prisutveckling: z.string().optional().nullable()
})

// Fastighetsfunktioner
export const featuresObjektPartialSchema = z.object({
  balkong_terrass: z.boolean().optional().nullable(),
  hiss: z.boolean().optional().nullable(),
  vaning: floorSchema.optional().nullable(),
  kok: kokPartialSchema,
  badrum_antal: z.number().int().min(0).optional().nullable(),
  garage: z.string().optional().nullable(),
  forrad: z.boolean().optional().nullable(),
  tradgard: z.boolean().optional().nullable(),
  pool: z.boolean().optional().nullable(),
  kamin: z.boolean().optional().nullable()
})

// Teknisk information
export const technicalObjektPartialSchema = z.object({
  energiklass: energyClassSchema.optional().nullable(),
  byggmaterial: byggmaterialPartialSchema,
  uppvarmning: uppvarmningPartialSchema,
  ventilation: ventilationPartialSchema,
  elnat: elnatPartialSchema,
  bredband: bredbandPartialSchema
})

// Finansiell information
export const financialObjektPartialSchema = z.object({
  manadsavgift: priceSchema.optional().nullable(),
  driftkostnad: priceSchema.optional().nullable(),
  taxeringsvarde: priceSchema.optional().nullable(),
  pantbrev: priceSchema.optional().nullable()
})

// Plats information
export const locationObjektPartialSchema = z.object({
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  havsnara: z.boolean().optional().nullable(),
  sjonara: z.boolean().optional().nullable(),
  skogsnara: z.boolean().optional().nullable()
})

// Filter partial schema
export const objektFilterPartialSchema = z.object({
  status: z.string().optional(),
  typ: z.string().optional(),
  maklare_id: z.string().uuid().optional(),
  kommun: z.string().optional(),
  minPris: z.number().optional(),
  maxPris: z.number().optional(),
  minBoarea: z.number().optional(),
  maxBoarea: z.number().optional(),
  minRum: z.number().optional(),
  maxRum: z.number().optional()
})