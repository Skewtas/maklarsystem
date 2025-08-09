/**
 * Gemensamma enums som används över flera domäner
 */

// Status för olika entiteter
export const STATUS_VALUES = [
  'kundbearbetning',
  'uppdrag',
  'till_salu',
  'sald',
  'tilltraden'
] as const

export type StatusType = typeof STATUS_VALUES[number]

// Energiklasser
export const ENERGY_CLASS_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const

export type EnergyClassType = typeof ENERGY_CLASS_VALUES[number]

// Standardnivåer för fastigheter
export const STANDARD_NIVA_VALUES = [
  'hög',
  'mycket_hög',
  'normal',
  'låg',
  'renovering_behövs',
  'totalrenovering_krävs'
] as const

export type StandardNivaType = typeof STANDARD_NIVA_VALUES[number]

// Laddbox-typer
export const LADDBOX_TYP_VALUES = [
  '1-fas_3.7kW',
  '3-fas_11kW',
  '3-fas_22kW',
  'dc_snabbladdare'
] as const

export type LaddboxTypType = typeof LADDBOX_TYP_VALUES[number]