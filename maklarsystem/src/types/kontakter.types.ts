/**
 * Enhanced types for contact (kontakter) entities
 */

import { Database } from './database'
import { z } from 'zod'
import { kontaktCreateSchema, kontaktUpdateSchema, kontaktFilterSchema } from '@/lib/validation/schemas/kontakter.schema'

// Base database types
export type KontaktRow = Database['public']['Tables']['kontakter']['Row']
export type KontaktInsert = Database['public']['Tables']['kontakter']['Insert']
export type KontaktUpdate = Database['public']['Tables']['kontakter']['Update']

// Validated types from Zod schemas
export type ValidatedKontaktCreate = z.infer<typeof kontaktCreateSchema>
export type ValidatedKontaktUpdate = z.infer<typeof kontaktUpdateSchema>
export type ValidatedKontaktFilter = z.infer<typeof kontaktFilterSchema>

// Extended types with relationships
export interface KontaktWithRelations extends KontaktRow {
  objekt_som_saljare?: Array<{
    id: string
    objektnummer: string
    adress: string
    status: string
  }>
  objekt_som_kopare?: Array<{
    id: string
    objektnummer: string
    adress: string
    status: string
  }>
  bud?: Array<{
    id: string
    objekt_id: string
    belopp: number
    status: string
    datum: string
  }>
}

// Computed properties
export interface KontaktComputed extends KontaktWithRelations {
  fullName: string
  displayName: string
  hasActiveDeals: boolean
  totalBids: number
  totalPurchases: number
  totalSales: number
  isActive: boolean
}

// Form data types
export type KontaktFormData = {
  // All fields from contact create schema as partial
  typ?: 'privatperson' | 'foretag'
  kategori?: 'saljare' | 'kopare' | 'spekulant' | 'ovrig'
  fornamn?: string
  efternamn?: string
  foretag?: string
  email?: string | null
  telefon?: string | null
  mobil?: string | null
  adress?: string | null
  postnummer?: string | null
  ort?: string | null
  personnummer?: string | null
  organisationsnummer?: string | null
  // Additional UI-specific fields
  profileImage?: File
  documents?: File[]
}

// List item type (for tables/grids)
export interface KontaktListItem {
  id: string
  typ: 'privatperson' | 'foretag'
  kategori: string
  displayName: string
  email: string | null
  telefon: string | null
  ort: string | null
  created_at: string
  active_deals: number
  total_bids: number
}

// Statistics type
export interface KontaktStatistics {
  totalCount: number
  byType: {
    privatperson: number
    foretag: number
  }
  byCategory: Record<string, number>
  activeContacts: number
  newThisMonth: number
}

// Search result type
export interface KontaktSearchResult {
  items: KontaktListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Helper functions for computed properties
export function computeKontaktProperties(kontakt: KontaktRow, relations?: Partial<KontaktWithRelations>): Partial<KontaktComputed> {
  const computed: Partial<KontaktComputed> = {}

  // Full name
  if (kontakt.typ === 'privatperson') {
    computed.fullName = [kontakt.fornamn, kontakt.efternamn]
      .filter(Boolean)
      .join(' ')
  } else {
    computed.fullName = kontakt.foretag || ''
  }

  // Display name (with company if applicable)
  if (kontakt.typ === 'privatperson') {
    computed.displayName = computed.fullName
  } else {
    const contactPerson = [kontakt.fornamn, kontakt.efternamn]
      .filter(Boolean)
      .join(' ')
    computed.displayName = contactPerson 
      ? `${kontakt.foretag} (${contactPerson})`
      : kontakt.foretag || ''
  }

  // Relationship counts
  if (relations) {
    computed.totalSales = relations.objekt_som_saljare?.length || 0
    computed.totalPurchases = relations.objekt_som_kopare?.length || 0
    computed.totalBids = relations.bud?.length || 0
    
    // Has active deals
    computed.hasActiveDeals = !!(
      relations.objekt_som_saljare?.some(o => 
        ['kundbearbetning', 'uppdrag', 'till_salu'].includes(o.status)
      ) ||
      relations.objekt_som_kopare?.some(o => 
        o.status === 'tilltraden'
      ) ||
      relations.bud?.some(b => b.status === 'aktivt')
    )
    
    computed.isActive = computed.hasActiveDeals
  }

  return computed
}

// Category display helpers
export const kontaktKategoriLabels: Record<string, string> = {
  saljare: 'Säljare',
  kopare: 'Köpare',
  spekulant: 'Spekulant',
  ovrig: 'Övrig'
}

export const kontaktKategoriColors: Record<string, string> = {
  saljare: 'bg-blue-100 text-blue-800',
  kopare: 'bg-green-100 text-green-800',
  spekulant: 'bg-yellow-100 text-yellow-800',
  ovrig: 'bg-gray-100 text-gray-800'
}

// Type display helpers
export const kontaktTypLabels: Record<string, string> = {
  privatperson: 'Privatperson',
  foretag: 'Företag'
}

export const kontaktTypIcons: Record<string, string> = {
  privatperson: 'user',
  foretag: 'building'
}

// Validation helpers
export function isPrivatperson(kontakt: KontaktRow | ValidatedKontaktCreate): boolean {
  return kontakt.typ === 'privatperson'
}

export function isForetag(kontakt: KontaktRow | ValidatedKontaktCreate): boolean {
  return kontakt.typ === 'foretag'
}

// Format helpers
export function formatKontaktAddress(kontakt: KontaktRow): string | null {
  const parts = [
    kontakt.adress,
    kontakt.postnummer,
    kontakt.ort
  ].filter(Boolean)
  
  return parts.length > 0 ? parts.join(', ') : null
}

export function formatKontaktPhone(kontakt: KontaktRow): string | null {
  return kontakt.mobil || kontakt.telefon || null
}

// Search helper
export function searchKontakter(
  kontakter: KontaktRow[],
  searchTerm: string
): KontaktRow[] {
  const term = searchTerm.toLowerCase()
  
  return kontakter.filter(kontakt => {
    const searchFields = [
      kontakt.fornamn,
      kontakt.efternamn,
      kontakt.foretag,
      kontakt.email,
      kontakt.telefon,
      kontakt.mobil,
      kontakt.ort,
      kontakt.personnummer,
      kontakt.organisationsnummer
    ].filter(Boolean).map(field => field!.toLowerCase())
    
    return searchFields.some(field => field.includes(term))
  })
}