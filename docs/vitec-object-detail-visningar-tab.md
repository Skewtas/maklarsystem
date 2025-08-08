# Vitec Express - Objektdetalj - Visningar-fliken

## Översikt
Visningar-fliken hanterar alla visningar för objektet, både kommande och avslutade. Den visar detaljerad information om varje visningstillfälle med datum, tid och uppföljningsstatus.

## Huvudfunktioner

### Toppnavigering
1. **Inställningar** - Konfigurera visningsinställningar
2. **Visningskommentarer** - Hantera kommentarer från visningar
3. **Ny visning** - Skapa ny visning (+-knapp)

### Visningskategorier

#### Kommande visningar (expanderbar sektion)
Lista över alla framtida visningar

#### Avslutade visningar (expanderbar sektion)
Historik över genomförda visningar

### Visningsinformation
Varje visning presenteras som ett kort med:

**Vänster del - Datum:**
- Dag (stor siffra)
- Månad (förkortning)
- År

**Höger del - Detaljer:**
- **Veckodag och datum** - t.ex. "söndag 25 augusti"
- **Tid** - Start- och sluttid (t.ex. "12:55 - 13:25")
- **Typ** - (tom i exemplen, troligen för visningstyp)

**Bottensektion - Statistik:**
- Ikoner för olika statistikpunkter
- Uppföljningsstatus - "0 av 0 uppföljda"

## Observerade visningar i exemplet

### Avslutade visningar (10 st)
1. **25 aug 2024** - söndag 12:55-13:25
2. **26 aug 2024** - måndag 18:35-19:05
3. **1 sep 2024** - söndag 12:30-17:00 (längre visning)
4. **3 sep 2024** - tisdag 18:00-19:30
5. **4 sep 2024** - onsdag 18:00-19:30
6. **5 sep 2024** - torsdag 18:00-19:30
7. **17 nov 2024** - söndag 14:00-14:30
8. **24 nov 2024** - söndag 15:00-16:00
9. **13 feb 2025** - torsdag (tid ej angiven)
10. **16 feb 2025** - söndag (tid ej angiven)

## Tekniska observationer

### UI/UX Patterns
1. **Kortbaserad layout** - Varje visning som separat kort
2. **Expanderbara sektioner** - Visa/dölj kategorier
3. **Kronologisk ordning** - Datum som primär sortering
4. **Visuell hierarki** - Tydlig datumvisning
5. **Statistikindikering** - Ikoner för olika metrics

### Visningstyper (förväntade)
- **Öppen visning** - För allmänheten
- **Privat visning** - Enskilda spekulanter
- **Digital visning** - Online/video
- **Förhandsvisning** - För utvalda
- **Extravisning** - Ytterligare tillfällen

### Datastruktur
```typescript
interface Viewing {
  id: string;
  objectId: string;
  
  // Tidsdata
  schedule: {
    date: Date;
    startTime: string;
    endTime: string;
    duration: number; // minuter
  };
  
  // Visningstyp
  type: 'open' | 'private' | 'digital' | 'preview' | 'extra';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  
  // Deltagare
  participants: {
    registered: number;
    attended: number;
    noShow: number;
    followedUp: number;
  };
  
  // Spekulanter
  prospects: {
    id: string;
    name: string;
    attended: boolean;
    feedback?: string;
    followUpStatus: 'pending' | 'completed' | 'not_needed';
  }[];
  
  // Kommentarer
  comments: {
    internal: string;
    public?: string;
  };
  
  // Ansvarig
  agent: {
    id: string;
    name: string;
  };
}
```

## Arbetsflöden

### Visningsplanering
1. **Schemaläggning** - Välj datum och tider
2. **Publicering** - Annonsera på olika plattformar
3. **Registrering** - Hantera anmälningar
4. **Påminnelser** - Automatiska utskick
5. **Genomförande** - Checklistor för visning
6. **Uppföljning** - Kontakta deltagare

### Visningstyper och strategier
- **Öppen visning** - Bred marknadsföring
- **Privat visning** - Personlig service
- **Drop-in** - Flexibla tider
- **Tema-visning** - Special events

## Förbättringsförslag för Mäklarsystem

### 1. Avancerad visningshantering
```typescript
interface EnhancedViewingManagement {
  // Schemaläggning
  scheduling: {
    autoOptimization: boolean;
    conflictDetection: boolean;
    multiObjectCoordination: boolean;
    agentAvailability: boolean;
  };
  
  // Digital integration
  digital: {
    virtualTours: boolean;
    liveStreaming: boolean;
    vrSupport: boolean;
    recordedViewings: boolean;
  };
  
  // Automatisering
  automation: {
    registrationHandling: boolean;
    reminderSequence: boolean;
    followUpCampaigns: boolean;
    feedbackCollection: boolean;
  };
}
```

### 2. Registrering och check-in
- **Online-registrering** - Formulär på hemsida
- **QR-kod check-in** - Vid visning
- **Kapacitetshantering** - Max antal deltagare
- **Väntelista** - Vid fullbokade visningar

### 3. Kommunikation
- **SMS-påminnelser** - Automatiska utskick
- **Email-bekräftelser** - Med vägbeskrivning
- **Push-notifikationer** - Via app
- **Kalenderintegration** - .ics-filer

### 4. Analys och rapportering
- **Deltagarstatistik** - Konverteringsgrad
- **Tidsoptimering** - Bästa visningstider
- **Feedback-analys** - Sentiment och förbättringar
- **ROI-mätning** - Effektivitet per visningstyp

### 5. COVID-19/Säkerhetsanpassningar
- **Tidsluckor** - Begränsat antal per slot
- **Hygienprotokoll** - Checklistor
- **Kontaktlös visning** - Digitala lösningar
- **Spårbarhet** - För eventuell smittspårning