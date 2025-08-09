/**
 * Test för refaktorerade schemas för att säkerställa att de fungerar korrekt
 */

import { describe, it, expect } from '@jest/globals'
import { 
  STATUS_VALUES, 
  KONTAKT_TYP_VALUES, 
  OBJEKT_TYP_VALUES 
} from '../../enums'
import { 
  kontaktCreateSchema, 
  kontaktUpdateSchema 
} from '../schemas/kontakter.schema'
import { 
  objektCreateSchema, 
  objektUpdateSchema 
} from '../schemas/objekt.schema'

describe('Refactored Validation Schemas', () => {
  describe('Enums', () => {
    it('should have correct status values', () => {
      expect(STATUS_VALUES).toContain('kundbearbetning')
      expect(STATUS_VALUES).toContain('sald')
    })

    it('should have correct kontakt typ values', () => {
      expect(KONTAKT_TYP_VALUES).toContain('privatperson')
      expect(KONTAKT_TYP_VALUES).toContain('foretag')
    })

    it('should have correct objekt typ values', () => {
      expect(OBJEKT_TYP_VALUES).toContain('villa')
      expect(OBJEKT_TYP_VALUES).toContain('lagenhet')
    })
  })

  describe('Kontakt Schemas', () => {
    it('should validate privatperson correctly', () => {
      const validPrivatperson = {
        typ: 'privatperson' as const,
        kategori: 'saljare' as const,
        fornamn: 'Anna',
        efternamn: 'Andersson',
        email: 'anna@example.com'
      }

      const result = kontaktCreateSchema.safeParse(validPrivatperson)
      expect(result.success).toBe(true)
    })

    it('should validate foretag correctly', () => {
      const validForetag = {
        typ: 'foretag' as const,
        kategori: 'kopare' as const,
        foretag: 'Andersson AB',
        email: 'info@andersson.se'
      }

      const result = kontaktCreateSchema.safeParse(validForetag)
      expect(result.success).toBe(true)
    })
  })

  describe('Objekt Schemas', () => {
    it('should validate basic objekt correctly', () => {
      const validObjekt = {
        typ: 'villa' as const,
        adress: 'Storgatan 1',
        postnummer: '123 45',
        ort: 'Stockholm',
        kommun: 'Stockholm',
        lan: 'Stockholm',
        maklare_id: '550e8400-e29b-41d4-a716-446655440000'
      }

      const result = objektCreateSchema.safeParse(validObjekt)
      expect(result.success).toBe(true)
    })
  })

  describe('Update Schemas', () => {
    it('should allow partial updates for kontakt', () => {
      const partialUpdate = {
        email: 'newemail@example.com'
      }

      const result = kontaktUpdateSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('should allow partial updates for objekt', () => {
      const partialUpdate = {
        boarea: 120,
        rum: 4
      }

      const result = objektUpdateSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })
  })
})