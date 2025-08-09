/**
 * Enums för kontakt-entiteter
 */

// Kontakttyper
export const KONTAKT_TYP_VALUES = ['privatperson', 'foretag'] as const

export type KontaktTypType = typeof KONTAKT_TYP_VALUES[number]

// Kontaktkategorier
export const KONTAKT_KATEGORI_VALUES = ['saljare', 'kopare', 'spekulant', 'ovrig'] as const

export type KontaktKategoriType = typeof KONTAKT_KATEGORI_VALUES[number]