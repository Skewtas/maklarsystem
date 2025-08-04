/**
 * Enhanced types for property (objekt) entities
 */

import { Database } from './database'
import { z } from 'zod'
import { objektCreateSchema, objektUpdateSchema, objektFilterSchema } from '@/lib/validation/schemas/objekt.schema'

// Base database types
export type ObjektRow = Database['public']['Tables']['objekt']['Row']
export type ObjektInsert = Database['public']['Tables']['objekt']['Insert']
export type ObjektUpdate = Database['public']['Tables']['objekt']['Update']

// Validated types from Zod schemas
export type ValidatedObjektCreate = z.infer<typeof objektCreateSchema>
export type ValidatedObjektUpdate = z.infer<typeof objektUpdateSchema>
export type ValidatedObjektFilter = z.infer<typeof objektFilterSchema>

// Extended types with relationships
export interface ObjektWithRelations extends ObjektRow {
  maklare?: {
    id: string
    full_name: string | null
    email: string
  }
  saljare?: {
    id: string
    fornamn: string | null
    efternamn: string | null
  }
  kopare?: {
    id: string
    fornamn: string | null
    efternamn: string | null
  }
  visningar?: Array<{
    id: string
    datum: string
    starttid: string
    sluttid: string
    typ: 'oppen' | 'privat' | 'digital'
    antal_besokare: number | null
  }>
  bud?: Array<{
    id: string
    belopp: number
    datum: string
    tid: string
    status: 'aktivt' | 'accepterat' | 'avslaget' | 'tillbakadraget'
    spekulant: {
      fornamn: string | null
      efternamn: string | null
    }
  }>
}

// Computed properties
export interface ObjektComputed extends ObjektWithRelations {
  fullAddress: string
  pricePerSqm: number | null
  totalArea: number | null
  monthlyTotalCost: number | null
  daysOnMarket: number | null
  hasModernAmenities: boolean
  environmentalScore: number | null
}

// Form data types
export interface ObjektFormData extends Partial<ValidatedObjektCreate> {
  // Additional UI-specific fields
  images?: File[]
  documents?: File[]
  virtualTourFile?: File
}

// List item type (for tables/grids)
export interface ObjektListItem {
  id: string
  objektnummer: string
  typ: string
  status: string
  adress: string
  ort: string
  utgangspris: number | null
  boarea: number | null
  rum: number | null
  maklare: string | null
  created_at: string
  visningar_count: number
  bud_count: number
  highest_bid: number | null
}

// Statistics type
export interface ObjektStatistics {
  totalCount: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  averagePrice: number | null
  averagePricePerSqm: number | null
  averageDaysOnMarket: number | null
  totalValue: number
}

// Search result type
export interface ObjektSearchResult {
  items: ObjektListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Helper functions for computed properties
export function computeObjektProperties(objekt: ObjektRow): Partial<ObjektComputed> {
  const computed: Partial<ObjektComputed> = {
    fullAddress: `${objekt.adress}, ${objekt.postnummer} ${objekt.ort}`,
  }

  // Price per sqm
  if (objekt.utgangspris && objekt.boarea) {
    computed.pricePerSqm = Math.round(objekt.utgangspris / objekt.boarea)
  }

  // Total area
  computed.totalArea = (objekt.boarea || 0) + (objekt.biarea || 0)

  // Monthly total cost
  let monthlyCost = 0
  if (objekt.manadsavgift) monthlyCost += objekt.manadsavgift
  if (objekt.driftkostnad) monthlyCost += objekt.driftkostnad / 12
  if (objekt.forsakringskostnad) monthlyCost += objekt.forsakringskostnad / 12
  if (objekt.uppvarmningskostnad) monthlyCost += objekt.uppvarmningskostnad / 12
  computed.monthlyTotalCost = monthlyCost > 0 ? Math.round(monthlyCost) : null

  // Days on market
  if (objekt.listningsdatum) {
    const listed = new Date(objekt.listningsdatum)
    const today = new Date()
    const days = Math.floor((today.getTime() - listed.getTime()) / (1000 * 60 * 60 * 24))
    computed.daysOnMarket = days
  }

  // Modern amenities
  computed.hasModernAmenities = !!(
    objekt.laddbox ||
    objekt.solceller ||
    objekt.bredband === 'fiber' ||
    objekt.uppvarmning === 'bergvärme' ||
    objekt.uppvarmning === 'luftvärmepump'
  )

  // Environmental score (0-100)
  let envScore = 50 // Base score
  if (objekt.energiklass) {
    const classScores: Record<string, number> = {
      'A': 20, 'B': 15, 'C': 10, 'D': 5, 'E': 0, 'F': -5, 'G': -10
    }
    envScore += classScores[objekt.energiklass] || 0
  }
  if (objekt.solceller) envScore += 15
  if (objekt.uppvarmning === 'bergvärme' || objekt.uppvarmning === 'luftvärmepump') envScore += 10
  if (objekt.laddbox) envScore += 5
  computed.environmentalScore = Math.max(0, Math.min(100, envScore))

  return computed
}

// Status display helpers
export const objektStatusLabels: Record<string, string> = {
  kundbearbetning: 'Kundbearbetning',
  uppdrag: 'Uppdrag',
  till_salu: 'Till salu',
  sald: 'Såld',
  tilltraden: 'Tillträden'
}

export const objektStatusColors: Record<string, string> = {
  kundbearbetning: 'bg-gray-100 text-gray-800',
  uppdrag: 'bg-blue-100 text-blue-800',
  till_salu: 'bg-green-100 text-green-800',
  sald: 'bg-purple-100 text-purple-800',
  tilltraden: 'bg-orange-100 text-orange-800'
}

// Type display helpers
export const objektTypLabels: Record<string, string> = {
  villa: 'Villa',
  lagenhet: 'Lägenhet',
  radhus: 'Radhus',
  fritidshus: 'Fritidshus',
  tomt: 'Tomt'
}

export const objektUndertypLabels: Record<string, string> = {
  parhus: 'Parhus',
  kedjehus: 'Kedjehus',
  radhus_mellan: 'Radhus (mellan)',
  radhus_gavelbostad: 'Radhus (gavel)',
  enplansvilla: 'Enplansvilla',
  tvåplansvilla: 'Tvåplansvilla',
  souterrangvilla: 'Souterrängvilla',
  sluttningshus: 'Sluttningshus',
  atriumhus: 'Atriumhus',
  funkisvilla: 'Funkisvilla',
  herrgård: 'Herrgård',
  torp: 'Torp',
  sjötomt: 'Sjötomt',
  skogstomt: 'Skogstomt',
  åkertomt: 'Åkertomt'
}