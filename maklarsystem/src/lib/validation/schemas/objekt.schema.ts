/**
 * Validation schemas for property (objekt) entities
 */

import { z } from 'zod'
import {
  objektTypPartialSchema,
  objektUndertypPartialSchema,
  agareTypPartialSchema,
  agandekategoriPartialSchema,
  pristypPartialSchema,
  kokPartialSchema,
  byggmaterialPartialSchema,
  uppvarmningPartialSchema,
  ventilationPartialSchema,
  elnatPartialSchema,
  bredbandPartialSchema,
  baseObjektPartialSchema,
  optionalObjektPartialSchema,
  priority1ObjektPartialSchema,
  priority2ObjektPartialSchema,
  ownershipObjektPartialSchema,
  pricingObjektPartialSchema,
  featuresObjektPartialSchema,
  technicalObjektPartialSchema,
  financialObjektPartialSchema,
  locationObjektPartialSchema,
  objektFilterPartialSchema
} from './partials/objekt.partial'

// Re-export för bakåtkompatibilitet
export const objektTypSchema = objektTypPartialSchema
export const objektUndertypSchema = objektUndertypPartialSchema
export const agareTypSchema = agareTypPartialSchema
export const agandekategoriSchema = agandekategoriPartialSchema
export const pristypSchema = pristypPartialSchema
export const kokSchema = kokPartialSchema
export const byggmaterialSchema = byggmaterialPartialSchema
export const uppvarmningSchema = uppvarmningPartialSchema
export const ventilationSchema = ventilationPartialSchema
export const elnatSchema = elnatPartialSchema
export const bredbandSchema = bredbandPartialSchema

// Base objekt schema for creation (kombinerar alla partial schemas)
export const objektCreateSchema = baseObjektPartialSchema
  .merge(optionalObjektPartialSchema)
  .merge(priority1ObjektPartialSchema)
  .merge(priority2ObjektPartialSchema)
  .merge(ownershipObjektPartialSchema)
  .merge(pricingObjektPartialSchema)
  .merge(featuresObjektPartialSchema)
  .merge(technicalObjektPartialSchema)
  .merge(financialObjektPartialSchema)
  .merge(locationObjektPartialSchema)

// Update schema (all fields optional)
export const objektUpdateSchema = objektCreateSchema.partial()

// Search/filter schema (använder partial schema)
export const objektFilterSchema = objektFilterPartialSchema

// Type exports
export type ObjektCreate = z.infer<typeof objektCreateSchema>
export type ObjektUpdate = z.infer<typeof objektUpdateSchema>
export type ObjektFilter = z.infer<typeof objektFilterSchema>