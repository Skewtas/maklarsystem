export interface Objekt {
  id: string;
  titel: string;
  beskrivning: string;
  adress: string;
  ort: string;
  omrade: string;
  postnummer: string;
  pris: number;
  boarea: number;
  rum: number;
  sovrum?: number;
  byggår?: number;
  energiklass?: string;
  månadsavgift?: number;
  driftkostnad?: number;
  utgångspris?: number;
  typ: 'lägenhet' | 'villa' | 'radhus' | 'tomt' | 'kommersiell';
  status: 'till_salu' | 'såld' | 'reserverad' | 'kommande';
  bilder: ObjektBild[];
  specifikationer: ObjektSpecifikation[];
  dokument: ObjektDokument[];
  visningar: Visning[];
  historik: ObjektHistorik[];
  maklare: Mäklare;
  skapad: Date;
  uppdaterad: Date;
}

export interface ObjektBild {
  id: string;
  url: string;
  alt: string;
  ordning: number;
  typ: 'huvud' | 'interiör' | 'exteriör' | 'planritning';
}

export interface ObjektSpecifikation {
  id: string;
  kategori: string;
  namn: string;
  värde: string;
  enhet?: string;
}

export interface ObjektDokument {
  id: string;
  namn: string;
  typ: 'pdf' | 'doc' | 'img';
  storlek: number;
  url: string;
  uppladdad: Date;
}

export interface Visning {
  id: string;
  datum: Date;
  startTid: string;
  slutTid: string;
  typ: 'öppet_hus' | 'privat' | 'digital';
  beskrivning?: string;
  tid: string; // For simplified component compatibility
}

export interface Mäklare {
  id: string;
  namn: string;
  email: string;
  telefon: string;
  profilBild?: string;
  titel?: string;
}

export interface ObjektHistorik {
  id: string;
  objektId: string;
  händelse: 'skapad' | 'prisändring' | 'statusändring' | 'uppdaterad';
  datum: Date;
  beskrivning: string;
  värde?: string;
  typ: string; // For simplified component compatibility
}