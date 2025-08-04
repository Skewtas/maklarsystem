/**
 * Common validation schemas used across the application
 */

import { z } from 'zod'
import { 
  STATUS_VALUES, 
  ENERGY_CLASS_VALUES, 
  STANDARD_NIVA_VALUES, 
  LADDBOX_TYP_VALUES 
} from '../../enums'

// Swedish postal code format (XXX XX)
export const svensktPostnummerSchema = z
  .string()
  .regex(/^\d{3}\s?\d{2}$/, 'Ogiltigt postnummer format (XXX XX)')
  .transform(val => val.replace(/\s/g, ''))
  .transform(val => `${val.slice(0, 3)} ${val.slice(3)}`)

// Swedish phone number format
export const svensktTelefonnummerSchema = z
  .string()
  .regex(/^(\+46|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{4}$/, 'Ogiltigt telefonnummer')
  .transform(val => val.replace(/[\s-]/g, ''))

// Email validation
export const emailSchema = z
  .string()
  .email('Ogiltig e-postadress')
  .toLowerCase()

// Non-empty string
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'Detta fält är obligatoriskt')
  .trim()

// Positive number
export const positiveNumberSchema = z
  .number()
  .positive('Måste vara ett positivt tal')

// Optional positive number
export const optionalPositiveNumberSchema = z
  .number()
  .positive('Måste vara ett positivt tal')
  .optional()
  .nullable()

// Date schema
export const dateSchema = z
  .string()
  .or(z.date())
  .transform(val => {
    if (typeof val === 'string') {
      return new Date(val)
    }
    return val
  })

// Optional date
export const optionalDateSchema = dateSchema.optional().nullable()

// URL validation
export const urlSchema = z
  .string()
  .url('Ogiltig URL')
  .optional()
  .nullable()

// Year validation (1800-current year + 10)
const currentYear = new Date().getFullYear()
export const yearSchema = z
  .number()
  .int('Måste vara ett heltal')
  .min(1800, 'År måste vara efter 1800')
  .max(currentYear + 10, `År kan inte vara senare än ${currentYear + 10}`)

// Price range
export const priceSchema = z
  .number()
  .min(0, 'Pris kan inte vara negativt')
  .max(1000000000, 'Pris verkar orimligt högt')

// Area measurements (square meters)
export const areaSchema = z
  .number()
  .min(0, 'Area kan inte vara negativ')
  .max(100000, 'Area verkar orimligt stor')

// Room count
export const roomCountSchema = z
  .number()
  .min(1, 'Minst 1 rum krävs')
  .max(50, 'Antal rum verkar orimligt')
  .or(z.number().min(0.5).max(50)) // Allow half rooms like 2.5

// Floor number
export const floorSchema = z
  .number()
  .int('Våning måste vara ett heltal')
  .min(-2, 'Våning kan inte vara lägre än -2')
  .max(100, 'Våning verkar orimligt hög')

// Percentage (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'Procent kan inte vara negativt')
  .max(100, 'Procent kan inte överstiga 100')

// Common status enum
export const statusSchema = z.enum(STATUS_VALUES, {
  errorMap: () => ({ message: 'Ogiltig status' })
})

// Energy class enum
export const energyClassSchema = z.enum(ENERGY_CLASS_VALUES, {
  errorMap: () => ({ message: 'Ogiltig energiklass' })
})

// Property condition/standard
export const standardNivaSchema = z.enum(STANDARD_NIVA_VALUES, {
  errorMap: () => ({ message: 'Ogiltig standardnivå' })
})

// Charging box types
export const laddboxTypSchema = z.enum(LADDBOX_TYP_VALUES, {
  errorMap: () => ({ message: 'Ogiltig laddbox-typ' })
})