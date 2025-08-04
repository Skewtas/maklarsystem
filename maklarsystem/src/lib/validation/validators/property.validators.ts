/**
 * Property-specific validators
 */

import { z } from 'zod'

// Note: fastighetsbeteckningValidator is now in swedish.validators.ts to avoid duplication

/**
 * Validates that boarea is greater than biarea
 */
export function areaRelationValidator(boarea?: number | null, biarea?: number | null): boolean {
  if (!boarea || !biarea) return true // Skip if either is not provided
  return boarea >= biarea
}

/**
 * Validates room count format (allows decimals like 2.5)
 */
export function rumValidator(value: number): boolean {
  if (value <= 0) return false
  
  // Allow whole numbers and .5 decimals
  const remainder = value % 0.5
  return remainder === 0
}

/**
 * Validates build year is reasonable
 */
export function byggaarValidator(year: number): boolean {
  const currentYear = new Date().getFullYear()
  
  // Buildings can't be from before 1600 or from far future
  return year >= 1600 && year <= currentYear + 5
}

/**
 * Validates price relationships
 */
export function priceRelationValidator(
  utgangspris?: number | null,
  slutpris?: number | null,
  accepterat_pris?: number | null
): boolean {
  // If slutpris exists, it should be reasonable compared to utgangspris
  if (utgangspris && slutpris) {
    // Final price typically within 50% up or down from asking price
    const ratio = slutpris / utgangspris
    if (ratio < 0.5 || ratio > 1.5) {
      return false
    }
  }
  
  // Accepted price should be close to final price if both exist
  if (slutpris && accepterat_pris) {
    const difference = Math.abs(slutpris - accepterat_pris)
    const tolerance = slutpris * 0.05 // 5% tolerance
    if (difference > tolerance) {
      return false
    }
  }
  
  return true
}

/**
 * Validates energy performance value
 */
export function energiprestadaValidator(value: number): boolean {
  // Typical range is 0-500 kWh/m²/year
  return value >= 0 && value <= 500
}

/**
 * Validates solar panel capacity
 */
export function solcellerKapacitetValidator(kwp: number): boolean {
  // Typical residential installations are 3-20 kWp
  return kwp >= 0.5 && kwp <= 50
}

/**
 * Validates coordinate values
 */
export function coordinateValidator(lat?: number | null, lng?: number | null): boolean {
  if (!lat || !lng) return true // Optional fields
  
  // Sweden's approximate boundaries
  const swedenBounds = {
    minLat: 55.0,  // Southern tip
    maxLat: 69.5,  // Northern tip
    minLng: 10.5,  // Western edge
    maxLng: 24.5   // Eastern edge
  }
  
  return lat >= swedenBounds.minLat && lat <= swedenBounds.maxLat &&
         lng >= swedenBounds.minLng && lng <= swedenBounds.maxLng
}

/**
 * Custom Zod refinements for property validation
 */
export const propertyRefinements = {
  areaRelation: (schema: z.ZodObject<any>) => 
    schema.refine(
      (data) => areaRelationValidator(data.boarea, data.biarea),
      {
        message: 'Boarea måste vara större än eller lika med biarea',
        path: ['biarea']
      }
    ),
    
  priceRelation: (schema: z.ZodObject<any>) =>
    schema.refine(
      (data) => priceRelationValidator(data.utgangspris, data.slutpris, data.accepterat_pris),
      {
        message: 'Prisrelationerna verkar orimliga',
        path: ['slutpris']
      }
    ),
    
  coordinates: (schema: z.ZodObject<any>) =>
    schema.refine(
      (data) => coordinateValidator(data.latitude, data.longitude),
      {
        message: 'Koordinaterna ligger utanför Sverige',
        path: ['latitude']
      }
    ),
    
  energyWithClass: (schema: z.ZodObject<any>) =>
    schema.refine(
      (data) => {
        // If energy class is provided, energy performance should align
        if (data.energiklass && data.energiprestanda) {
          const expectedRanges: Record<string, [number, number]> = {
            'A': [0, 50],
            'B': [51, 75],
            'C': [76, 100],
            'D': [101, 150],
            'E': [151, 200],
            'F': [201, 300],
            'G': [301, 500]
          }
          
          const range = expectedRanges[data.energiklass]
          if (range) {
            return data.energiprestanda >= range[0] && data.energiprestanda <= range[1]
          }
        }
        return true
      },
      {
        message: 'Energiprestanda stämmer inte överens med energiklassen',
        path: ['energiprestanda']
      }
    )
}