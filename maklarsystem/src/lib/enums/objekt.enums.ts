/**
 * Enums för objekt/fastighet-entiteter
 */

// Objekttyper
export const OBJEKT_TYP_VALUES = ['villa', 'lagenhet', 'radhus', 'fritidshus', 'tomt'] as const

export type ObjektTypType = typeof OBJEKT_TYP_VALUES[number]

// Objekt-undertyper
export const OBJEKT_UNDERTYP_VALUES = [
  'parhus',
  'kedjehus',
  'radhus_mellan',
  'radhus_gavelbostad',
  'enplansvilla',
  'tvåplansvilla',
  'souterrangvilla',
  'sluttningshus',
  'atriumhus',
  'funkisvilla',
  'herrgård',
  'torp',
  'sjötomt',
  'skogstomt',
  'åkertomt'
] as const

export type ObjektUndertypType = typeof OBJEKT_UNDERTYP_VALUES[number]

// Ägartyper
export const AGARE_TYP_VALUES = ['privatperson', 'foretag', 'kommun', 'stat'] as const

export type AgareTypType = typeof AGARE_TYP_VALUES[number]

// Ägandekategorier
export const AGANDEKATEGORI_VALUES = ['agt', 'bostadsratt', 'hyresratt', 'arrende'] as const

export type AgandekategoriType = typeof AGANDEKATEGORI_VALUES[number]

// Pristyper
export const PRISTYP_VALUES = ['fast', 'forhandling', 'budgivning'] as const

export type PristypType = typeof PRISTYP_VALUES[number]

// Kökstyper
export const KOK_VALUES = [
  'kokso',
  'halvoppet',
  'oppet',
  'kokonk',
  'modernt',
  'renoverat',
  'originalskick'
] as const

export type KokType = typeof KOK_VALUES[number]

// Byggmaterial
export const BYGGMATERIAL_VALUES = [
  'tegel',
  'trak',
  'betong',
  'puts',
  'panel',
  'natursten',
  'annat'
] as const

export type ByggmaterialType = typeof BYGGMATERIAL_VALUES[number]

// Uppvärmningstyper
export const UPPVARMNING_VALUES = [
  'fjärrvärme',
  'elvärme',
  'pelletsbrännare',
  'vedeldning',
  'olja',
  'gas',
  'bergvärme',
  'luftvärmepump',
  'annat'
] as const

export type UppervarmningType = typeof UPPVARMNING_VALUES[number]

// Ventilationstyper
export const VENTILATION_VALUES = [
  'mekanisk_til_och_franluft',
  'mekanisk_franluft',
  'naturlig',
  'balanserad',
  'frånluft'
] as const

export type VentilationType = typeof VENTILATION_VALUES[number]

// Elnätstyper
export const ELNAT_VALUES = [
  'trefas',
  'enfas',
  'trefas_16A',
  'trefas_25A',
  'trefas_35A'
] as const

export type ElnatType = typeof ELNAT_VALUES[number]

// Bredbandtyper
export const BREDBAND_VALUES = [
  'fiber',
  'adsl',
  'kabel',
  'mobilt',
  'satellit',
  'inte_tillgangligt'
] as const

export type BredbandType = typeof BREDBAND_VALUES[number]