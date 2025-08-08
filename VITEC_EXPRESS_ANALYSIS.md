# Vitec Express Funktionsanalys

## Översikt
Detta dokument samlar all information om Vitec Express funktionalitet för implementation i Mäklarsystem.

## Huvudkategorier från Kunskapsdatabasen

### 1. Ny i Express Mäklarsystem (178 artiklar)
- **Status**: Väntar på data
- **Prioritet**: HÖG - Grundläggande förståelse

### 2. Säljprocessen
- Hantering av säljuppdrag från start till slut
- Integration med marknadsplatser
- Dokumenthantering

### 3. Startsida på Hemnet och andra marknadssidor
- Publicering till externa plattformar
- Synkronisering av objektdata
- Marknadsföringsverktyg

### 4. Dokument i Express
- Dokumentmallar
- Automatisk generering
- Arkivering och versionshantering

### 5. Supportfilmer (150 st)
- Grundkurs Express Publish
- Skapa ett Projekt
- Grundkurs Express DHS
- Annonsera i Sociala medier

### 6. Express Publish (14 artiklar)
- Publiceringsfunktioner
- Marknadsföringsverktyg

### 7. Connect API (7 artiklar)
- API-integration
- Datasynkronisering
- Externa kopplingar

## Communityforum Kategorier

### Allmän info (12)
- Regional support
- Systemuppdateringar

### Nyheter (123)
- Express Mäklarsystem Version 2025.11
- Express Mäklarsystem Version 2025.10

### Utbildning (46)
- Utbildningsmaterial
- Kurser och workshops

## Kärnfunktioner att implementera

### Fas 1: Grundläggande funktionalitet
1. **Objekthantering**
   - Skapa/redigera objekt
   - Bildhantering
   - Statushantering

2. **Kontakthantering**
   - Säljare/köpare/spekulanter
   - Kommunikationshistorik
   - GDPR-compliance

3. **Visningshantering**
   - Bokningssystem
   - Påminnelser
   - Deltagarlista

### Fas 2: Avancerade funktioner
1. **Budhantering**
   - Digital budgivning
   - Budlogg
   - Automatiska bekräftelser

2. **Dokumenthantering**
   - Mallar
   - E-signering
   - Arkivering

3. **Marknadsföring**
   - Publicering till Hemnet/Booli
   - Social media integration
   - Annonsmallar

### Fas 3: Integration & Automation
1. **API-integrationer**
   - Externa marknadsplatser
   - Ekonomisystem
   - E-postsystem

2. **Rapporter & Analytics**
   - Försäljningsstatistik
   - Marknadsanalys
   - KPI-tracking

## Implementation i Mäklarsystem

### Teknisk arkitektur
- **Frontend**: Next.js 15 med App Router
- **Backend**: Supabase (PostgreSQL)
- **Realtid**: Supabase Realtime
- **Auth**: Supabase Auth (temporärt mock)
- **Storage**: Supabase Storage

### Datamodell (preliminär)
```typescript
// Objekt (Properties)
interface Objekt {
  id: string;
  adress: string;
  typ: 'villa' | 'bostadsratt' | 'tomt';
  status: 'kommande' | 'till_salu' | 'sald';
  pris: number;
  beskrivning: string;
  bilder: string[];
  maklare_id: string;
  // ... ytterligare fält
}

// Kontakter
interface Kontakt {
  id: string;
  typ: 'saljare' | 'kopare' | 'spekulant';
  namn: string;
  email: string;
  telefon: string;
  gdpr_samtycke: boolean;
  // ... ytterligare fält
}

// Visningar
interface Visning {
  id: string;
  objekt_id: string;
  datum: Date;
  tid: string;
  typ: 'oppen' | 'privat';
  anmalda: Kontakt[];
  // ... ytterligare fält
}
```

## Nästa steg
1. Samla in detaljerad dokumentation från "Ny i Express Mäklarsystem"
2. Analysera arbetsflöden och användarresor
3. Skapa detaljerad teknisk specifikation
4. Börja implementation fas för fas

## Frågor att besvara
- Vilka är de mest kritiska funktionerna för MVP?
- Hur fungerar integration med Hemnet/Booli API?
- Vilka legala krav måste uppfyllas?
- Hur hanteras e-signering av dokument?
- Vilka rapporter är mest efterfrågade?