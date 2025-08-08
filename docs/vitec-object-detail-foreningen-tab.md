# Vitec Express - Objektdetalj - Föreningen-fliken

## Översikt
Föreningen-fliken hanterar all information relaterad till bostadsrättsföreningen eller fastighetsägareföreningen. Den innehåller 5 huvudsektioner med detaljerad information om föreningens juridiska status, ekonomi, beskrivningar och kontakter.

## Navigeringsmeny (höger sida)
Snabbnavigering mellan sektioner:
1. **Förening** - Grundläggande föreningsdata
2. **Anteckningar** - Interna noteringar
3. **Beskrivningar** - Detaljerade beskrivningar om föreningen
4. **Ekonomi** - Ekonomisk information och avgifter
5. **Kontakter** - Föreningens kontaktpersoner

## Sektioner

### 1. Förening
Grundläggande information om föreningen:

**Föreningsval:**
- **Förening** - Sökfält med dropdown (BRF Ströva I Sundbyberg i exemplet)
- **Gå till föreningen** - Länk för att navigera till föreningens sida
- **Administrera föreningar** - Länk för att hantera föreningsregister

**Föreningsuppgifter:**
- **Organisationsnummer** - 769632-7274
- **Organisationsform/typ** - Bostadsrätt
- **Äkta/oäkta bostadsrättsförening** - Klassificering

**Fastighetsdata:**
- **Antal lägenheter** - 101
- **varav hyresrätter** - Antal hyresrätter
- **Antal lokaler** - Kommersiella lokaler

### 2. Anteckningar
Intern dokumentation:

- **Intern anteckning på aktuellt objekt** - Textfält för interna noteringar
- **Aktualitetsdatum** - 2024-07-05 (senaste uppdatering)
- **Aktualitetsdatum text** - Förklaring av datum

### 3. Beskrivningar
Omfattande beskrivningar med "Ändra för detta objekt"-funktion:

**Beskrivningsfält:**
1. **Allmänt om föreningen** - "Brf Ströva ligger i natursköna Järvastaden. Fastigheten byggdes 2018. I föreningen finns det 101 st lägenheter och samtliga upplåts med bostadsrätt. Förutom planteringar och en uteplats så finns det även garage."

2. **Renoveringar - utförda och planerade** - Information om renoveringar

3. **Parkering** - "77 garageplatser. Föreningen erbjuder även el-bils platser för uthyrning. Om du är intresserad av att hyra hör av dig till info@brfstrova.se. Handläggningstiden för parkering är ca 2 -3 veckor. P-platser finns tillgängliga, 850 kr för en liten plats och 1000 för en stor plats. Elbilsplats kostar 1000 kr plus förbrukning enligt styrelsen 2024-05-07. Parkering finns också på gatan, det är kommunens gata och taxa gäller."

4. **Tv och bredband** - Information om uppkoppling

5. **Försäkring** - "Fastigheterna är fullvärdesförsäkrad hos IF. Bostadsrättstillägg ingår för medlemmar."

6. **Gårdsplats** - "Mysig gård med planteringar och träd. Odlingslådor för egen odling finns för den som är intresserad."

7. **Gemensamma utrymmen** - "Övernattningslägenhet med pentry och WC med dusch finns för gäster. Priset ligger idag på 400 kr/ dygn (500 kr med parkering). Det finns även rullstolsrum , cykelrum, pingisrum och odlingslådor på innergården"

8. **Övrigt** - "Köparen tecknar eget elavtal. El debiteras varje månad efter faktiskt förbrukning."

### 4. Ekonomi
Ekonomisk information med "Ändra för detta objekt"-funktion:

**Ekonomifält:**
- **Information om månadsavgift** - Textfält (0 av 500 tecken)
- **Föreningens ekonomi och planerade förändringar** - Beskrivning
- **Andrahandsuthyrningspolicy** - Föreningens policy
- **Äger föreningen marken** - "Ja"

**Avgifter:**
- **Överlåtelseavgift (kr)** - Numeriskt fält
- **Överlåtelseavgift betalas av** - Dropdown (Köparen)
- **Pantsättningsavgift (kr)** - Numeriskt fält

**Köparbegränsningar:**
- **Tillåter föreningen juridisk person som köpare** - Dropdown (Ej angivet)
- **Tillåter föreningen delat ägande** - Textfält

### 5. Kontakter
Tabell med föreningens kontaktpersoner:

**Kolumner:**
- Namn
- Roll
- Mobil
- Tel
- E-post

## Tekniska observationer

### UI/UX Patterns
1. **Spara-knapp** - Överst på sidan (inaktiverad tills ändringar)
2. **Sektionsnavigering** - Höger sidopanel för snabb navigering
3. **Redigerbara fält** - "Ändra för detta objekt" aktiverar redigering
4. **Villkorlig visning** - Fält visas/döljs baserat på föreningstyp
5. **Integrerade länkar** - Direkt navigering till föreningens sida

### Datastruktur
```typescript
interface AssociationData {
  // Grunddata
  association: {
    id: string;
    name: string;
    organizationNumber: string;
    type: 'bostadsrätt' | 'äganderätt' | 'hyresrätt';
    genuine: boolean; // Äkta/oäkta
  };
  
  // Fastighetsdata
  property: {
    totalApartments: number;
    rentalApartments: number;
    commercialUnits: number;
    ownsLand: boolean;
  };
  
  // Beskrivningar
  descriptions: {
    general: string;
    renovations: string;
    parking: string;
    tvInternet: string;
    insurance: string;
    courtyard: string;
    commonAreas: string;
    other: string;
  };
  
  // Ekonomi
  economy: {
    monthlyFeeInfo: string;
    economicStatus: string;
    sublettingPolicy: string;
    transferFee: number;
    transferFeePaidBy: 'buyer' | 'seller';
    mortgageFee: number;
    allowsLegalEntity: boolean | null;
    allowsSharedOwnership: string;
  };
  
  // Kontakter
  contacts: {
    name: string;
    role: string;
    mobile?: string;
    phone?: string;
    email?: string;
  }[];
  
  // Metadata
  notes: {
    internal: string;
    lastUpdated: Date;
    updateDescription?: string;
  };
}
```

## Arbetsflöden

### Föreningsadministration
1. **Sökning** - Hitta förening via namn eller org.nr
2. **Länkning** - Koppla objekt till förening
3. **Uppdatering** - Håll föreningsdata aktuell
4. **Validering** - Kontrollera att data stämmer

### Informationshantering
1. **Inhämtning** - Från årsredovisning och stadgar
2. **Verifiering** - Kontrollera uppgifter
3. **Uppdatering** - Håll information aktuell
4. **Publicering** - Visa relevant info för köpare

## Förbättringsförslag för Mäklarsystem

### 1. Automatisk datahämtning
```typescript
interface AutomatedDataFetching {
  // Integration med offentliga register
  organizationData: {
    source: 'Bolagsverket' | 'Skatteverket';
    autoUpdate: boolean;
    lastFetched: Date;
  };
  
  // Ekonomisk data
  financialData: {
    annualReport: Document;
    keyFigures: FinancialMetrics;
    creditScore?: number;
  };
  
  // Stadgar och protokoll
  documents: {
    bylaws: Document;
    boardMinutes: Document[];
    memberMeetings: Document[];
  };
}
```

### 2. Föreningsanalys
- **Ekonomisk hälsa** - Automatisk bedömning
- **Nyckeltal** - Visualisering av viktiga mått
- **Riskbedömning** - Varningar för potentiella problem
- **Jämförelseverktyg** - Benchmarking mot liknande föreningar

### 3. Integration med myndigheter
- **Bolagsverket** - Hämta organisationsdata
- **Lantmäteriet** - Fastighetsdata
- **Skatteverket** - Skatteuppgifter
- **Kronofogden** - Kontroll av skulder

### 4. Dokumenthantering
- **OCR-scanning** - Automatisk textextrahering
- **Mallgenerering** - Skapa dokument från data
- **Versionshantering** - Spåra ändringar
- **Digital arkivering** - Säker lagring

### 5. Kommunikationsverktyg
- **Styrelseintegration** - Direktkontakt med styrelsen
- **Automatiska notifikationer** - Vid viktiga ändringar
- **FAQ-generator** - Baserat på föreningsdata
- **Chattfunktion** - För snabba frågor