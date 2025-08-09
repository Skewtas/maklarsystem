/**
 * Swedish real estate terminology mappings and types
 */

// Real estate terms mapping
export const swedishRealEstateTerms = {
  // Core entities
  objekt: 'property/listing',
  kontakter: 'contacts',
  visning: 'showing/open house',
  bud: 'bid/offer',
  mäklare: 'real estate agent',
  uppdrag: 'assignment/mandate',
  tillträde: 'closing/move-in date',
  
  // Contact types
  säljare: 'seller',
  köpare: 'buyer',
  spekulant: 'prospective buyer/interested party',
  
  // Property types
  villa: 'house/villa',
  lägenhet: 'apartment',
  radhus: 'townhouse',
  fritidshus: 'vacation home',
  tomt: 'lot/plot',
  
  // Property subtypes
  parhus: 'semi-detached house',
  kedjehus: 'row house',
  enplansvilla: 'single-story house',
  tvåplansvilla: 'two-story house',
  souterrängvilla: 'split-level house',
  
  // Property status
  kundbearbetning: 'client processing',
  till_salu: 'for sale',
  såld: 'sold',
  tillträden: 'closing',
  
  // Financial terms
  utgångspris: 'asking price',
  slutpris: 'final price',
  månadsavgift: 'monthly fee',
  driftkostnad: 'operating cost',
  taxeringsvärde: 'tax assessment value',
  pantbrev: 'mortgage deed',
  kontantinsats: 'down payment',
  
  // Areas
  boarea: 'living area',
  biarea: 'supplementary area',
  tomtarea: 'lot area',
  
  // Features
  balkong: 'balcony',
  terrass: 'terrace',
  hiss: 'elevator',
  förråd: 'storage',
  garage: 'garage',
  parkering: 'parking',
  
  // Technical
  energiklass: 'energy class',
  uppvärmning: 'heating',
  ventilation: 'ventilation',
  bredband: 'broadband',
  
  // Legal/Administrative
  fastighetsbeteckning: 'property designation',
  lagfart: 'title deed',
  servitut: 'easement',
  samfällighet: 'community association',
  andelstal: 'share ratio',
  
  // Documents
  objektbeskrivning: 'property description',
  köpekontrakt: 'purchase agreement',
  budgivningslista: 'bidding list',
  boendekostnadskalkyl: 'housing cost calculation',
  energideklaration: 'energy declaration',
  
  // Processes
  budgivning: 'bidding process',
  kontraktsskrivning: 'contract signing',
  besiktning: 'inspection',
  värdering: 'valuation',
  intresseanmälan: 'expression of interest'
} as const

// Type for Swedish terms
export type SwedishTerm = keyof typeof swedishRealEstateTerms
export type EnglishTranslation = typeof swedishRealEstateTerms[SwedishTerm]

// Common phrases and their translations
export const swedishPhrases = {
  // Greetings
  'Välkommen till visningen': 'Welcome to the showing',
  'Tack för ditt intresse': 'Thank you for your interest',
  
  // Status updates
  'Objektet är sålt': 'The property is sold',
  'Budgivning pågår': 'Bidding is in progress',
  'Visning inställd': 'Showing cancelled',
  
  // Forms and labels
  'Fyll i formuläret': 'Fill out the form',
  'Obligatoriska fält': 'Required fields',
  'Spara ändringar': 'Save changes',
  'Avbryt': 'Cancel',
  'Skicka': 'Send',
  
  // Validation messages
  'Ogiltigt värde': 'Invalid value',
  'Fältet är obligatoriskt': 'Field is required',
  'För långt': 'Too long',
  'För kort': 'Too short',
  
  // Common actions
  'Lägg till': 'Add',
  'Ta bort': 'Remove',
  'Redigera': 'Edit',
  'Visa mer': 'Show more',
  'Visa mindre': 'Show less',
  'Sök': 'Search',
  'Filtrera': 'Filter',
  'Sortera': 'Sort',
  
  // Time and dates
  'Idag': 'Today',
  'Imorgon': 'Tomorrow',
  'Denna vecka': 'This week',
  'Nästa vecka': 'Next week',
  'Denna månad': 'This month',
  
  // Property descriptions
  'Nära till kommunikationer': 'Close to public transport',
  'Barnvänligt område': 'Family-friendly area',
  'Lugnt läge': 'Quiet location',
  'Centralt belägen': 'Centrally located',
  'Sjöutsikt': 'Lake view',
  'Havsnära': 'Near the sea',
  
  // Financial
  'Inklusive värme': 'Heating included',
  'Exklusive el': 'Electricity not included',
  'Förskottsbetalning': 'Advance payment',
  'Avbetalning möjlig': 'Installment payment possible'
} as const

// Month names in Swedish
export const swedishMonths = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december'
] as const

// Weekday names in Swedish
export const swedishWeekdays = [
  'måndag',
  'tisdag',
  'onsdag',
  'torsdag',
  'fredag',
  'lördag',
  'söndag'
] as const

// Common abbreviations
export const swedishAbbreviations = {
  'kr': 'kronor',
  'kvm': 'kvadratmeter',
  'st': 'stycken',
  'ca': 'cirka',
  'inkl': 'inklusive',
  'exkl': 'exklusive',
  'ev': 'eventuellt',
  't.ex.': 'till exempel',
  'bl.a.': 'bland annat',
  'fr.o.m.': 'från och med',
  't.o.m.': 'till och med'
} as const

// Helper function to translate term
export function translateTerm(swedish: string): string {
  return swedishRealEstateTerms[swedish as SwedishTerm] || swedish
}

// Helper function to get Swedish term
export function getSwedishTerm(english: string): string | undefined {
  const entries = Object.entries(swedishRealEstateTerms)
  const found = entries.find(([_, eng]) => eng === english)
  return found?.[0]
}

// Format currency in Swedish format
export function formatSwedishCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date in Swedish format
export function formatSwedishDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('sv-SE').format(d)
}

// Format area with unit
export function formatArea(area: number, unit: 'kvm' | 'm²' = 'kvm'): string {
  return `${area} ${unit}`
}