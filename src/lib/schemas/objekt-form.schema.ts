import { z } from 'zod'

// Objekt form schema for React Hook Form validation
export const objektFormSchema = z.object({
  // Grundinformation
  sokbegrepp: z.string().min(1, 'Sökbegrepp krävs'),
  typ: z.enum(['villa', 'lagenhet', 'radhus', 'fritidshus', 'tomt']),
  upplatelse_form: z.enum(['bostadsratt', 'agt', 'hyresratt', 'arrende']),
  nyproduktion: z.boolean().optional().default(false),
  adress: z.string().min(1, 'Adress krävs'),
  postnummer: z.string().regex(/^\d{3}\s?\d{2}$/, 'Ogiltigt postnummer format'),
  ort: z.string().min(1, 'Ort krävs'),
  kommun: z.string().min(1, 'Kommun krävs'),
  omrade: z.string().optional(),
  fastighetsbeteckning: z.string().optional(),
  lagenhetsnummer_forening: z.string().optional(),
  lagenhetsnummer_register: z.string().optional(),
  portkod: z.string().optional(),
  nyckelnummer: z.string().optional(),
  arkivnummer: z.string().optional(),
  ovrigt_grundinfo: z.string().optional(),
  utokade_sokbegrepp: z.string().optional(),
  
  // Karta
  karta_typ: z.enum(['karta', 'satellit']).default('karta'),
  karta_leverantor: z.enum(['eniro', 'google', 'hitta']).default('eniro'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  
  // Interiör
  boarea: z.string().optional(),
  biarea: z.string().optional(),
  byggnadsyta: z.string().optional(),
  antal_rum: z.string().optional(),
  antal_sovrum: z.string().optional(),
  kokstyp: z.string().optional(),
  areakalla: z.string().optional(),
  kommentar_areakalla: z.string().optional(),
  allmant_interior: z.string().optional(),
  rumsbeskrivningar: z.array(z.object({
    namn: z.string(),
    beskrivning: z.string()
  })).default([]),
  
  // Beskrivningar
  saljfras: z.string().optional(),
  saljrubrik: z.string().optional(),
  kort_beskrivning: z.string().optional(),
  lang_beskrivning: z.string().optional(),
  vagbeskrivning: z.string().optional(),
  allmant_lagenhet: z.string().optional(),
  ovrigt_beskrivning: z.string().optional(),
  
  // Byggnad
  byggnadstyp: z.string().optional(),
  byggaar: z.string().optional(),
  konstruktion: z.string().optional(),
  grundlaggning: z.string().optional(),
  anlaggningsar: z.string().optional(),
  tillbyggnader: z.string().optional(),
  renoveringar: z.string().optional(),
  ovrigt_byggnad: z.string().optional(),
  
  // TV & Bredband
  tv_leverantor: z.string().optional(),
  bredband_leverantor: z.string().optional(),
  ovrigt_tv_bredband: z.string().optional(),
  
  // Ventilation
  ventilationstyp: z.string().optional(),
  ovrigt_ventilation: z.string().optional(),
  
  // Energideklaration
  energiklass: z.string().optional(),
  energianvandning: z.string().optional(),
  energideklaration_datum: z.string().optional(),
  ovrigt_energi: z.string().optional(),
  
  // Balkong & Uteplats
  balkong_uteplats_typ: z.string().optional(),
  balkong_uteplats_area: z.string().optional(),
  balkong_uteplats_vastersida: z.string().optional(),
  ovrigt_balkong: z.string().optional(),
  
  // Avgifter & Insats
  driftkostnad_manad: z.string().optional(),
  avgift_manad: z.string().optional(),
  hyra_manad: z.string().optional(),
  andel_kapital: z.string().optional(),
  ovrigt_avgifter: z.string().optional(),
  
  // Våning & Hiss
  vaning: z.string().optional(),
  antal_vaningar_byggnad: z.string().optional(),
  hiss: z.string().optional(),
  ovrigt_vaning: z.string().optional(),
  
  // Driftkostnader
  uppvarmning: z.string().optional(),
  varmvatten: z.string().optional(),
  el: z.string().optional(),
  sophantaring: z.string().optional(),
  ovrigt_drift: z.string().optional(),
  
  // Personer i hushållet
  personer_antal: z.string().optional(),
  personer_alder: z.string().optional(),
  husdjur: z.string().optional(),
  ovrigt_personer: z.string().optional(),
  
  // Omgivning
  kommunikation: z.string().optional(),
  narservice: z.string().optional(),
  parkering_omgivning: z.string().optional(),
  ovrigt_omgivning: z.string().optional(),
})

export type ObjektFormData = z.infer<typeof objektFormSchema>

// Default values for the form
export const objektFormDefaults: Partial<ObjektFormData> = {
  typ: 'lagenhet',
  upplatelse_form: 'bostadsratt',
  nyproduktion: false,
  kommun: 'Stockholm',
  karta_typ: 'karta',
  karta_leverantor: 'eniro',
  rumsbeskrivningar: [],
  sokbegrepp: '',
  adress: '',
  postnummer: '',
  ort: '',
}