# Vitec Express - Objektdetalj - Spekulanter-fliken

## Översikt
Spekulanter-fliken hanterar alla intressenter för ett objekt, inklusive deras status, visningar, budgivning och CRM-information. Den har en tvåpanelsdesign där vänster sida visar lista över spekulanter och höger sida visar detaljerad information om vald spekulant.

## Huvudfunktioner

### Toppnavigering
- **Importera** - Importera spekulanter från externa källor
- **Matcha** - Matcha spekulanter med befintliga kontakter
- **Budgivning** - Hantera budgivningsprocessen
- **Hjälp** - Kontextuell hjälp
- **Ny spekulant** - Lägg till ny spekulant (+-knapp)

### Filtreringsalternativ
1. **Sökfält** - "Namn, mobilnummer"
2. **Status** - Dropdown för spekulantstatus
3. **Visning** - Filtrera baserat på visningsdeltagande
4. **Deltog** - Om de deltog i visning
5. **Säljer objekt med status** - Om spekulanten själv säljer
6. **Lämnar** - Vad spekulanten lämnar
7. **Har lånelöfte** - Kryssruta för finansieringsstatus
8. **Leadskällor** - Var spekulanten kom från
9. **Visa fler filter** - Expandera för ytterligare filter

### Spekulantlista (vänster panel)
- **Kategorier**:
  - Spekulanter (huvudkategori)
  - Anvisade (alternativ vy)
- **Statusgrupper**:
  - Intresserade (1 i exemplet)
- **Spekulantinformation**:
  - Namn med avatar/initial
  - Högsta bud (om lagt)
  - Budstatus (dolt/synligt)
- **Statistik**:
  - Antal spekulanter (1 spekulant)
  - Bearbetningsgrad (100% bearbetning)

### Spekulantdetaljer (höger panel)

#### Huvudinformation
- **Namn** - Rani Shakir (i exemplet)
- **Status** - Intresserad (dropdown för statusändring)
- **Adress** - Stavangergatan 4
- **Senaste kontakt** - 25 jul 2025

#### Åtgärdsknappar (toppen)
- Redigera spekulant
- Skicka meddelande
- Ta bort spekulant

#### Sektioner

**1. Visningar**
- Nästa visning: Ingen inbokad
- Tidigare visningar: Inga tidigare visningar
- Åtgärder:
  - Boka visning
  - Inbokade visningstider
  - Följ upp (inaktiverad om inga visningar)

**2. Budgivning**
- Finansiering: Status (ej verifierad i exemplet)
- Åtgärder:
  - Lägg bud
  - Spekulantens budhistorik
  - Lägg till som köpare

**3. CRM**
- CRM-information och aktiviteter

**4. Säljare av**
- Lista objekt spekulanten säljer (Inga objekt i exemplet)

**5. Köpare av**
- Lista objekt spekulanten köpt (Inga objekt i exemplet)

**6. Spekulant på**
- Andra objekt spekulanten är intresserad av (Inga objekt i exemplet)

#### Händelser och anteckningar
- **Ny anteckning** - Textfält för att lägga till anteckningar
- **Händelselogg** - Historik över alla interaktioner
- Möjlighet att visa fler händelser

## Tekniska observationer

### UI/UX Patterns
1. **Master-detail layout** - Lista till vänster, detaljer till höger
2. **Statusindikering** - Visuell feedback på spekulantstatus
3. **Åtgärdsknappar** - Kontextuella åtgärder baserat på status
4. **Expanderbara sektioner** - För att hantera mycket information
5. **Realtidsuppdatering** - Bearbetningsgrad och statistik

### Datastruktur
```typescript
interface Spekulant {
  id: string;
  name: string;
  status: 'intresserad' | 'anvisad' | 'budgivare' | 'köpare' | 'avböjt';
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  
  // Visningar
  viewings: {
    scheduled: Viewing[];
    attended: Viewing[];
    noShow: Viewing[];
  };
  
  // Budgivning
  bidding: {
    highestBid?: number;
    bidHistory: Bid[];
    financing: {
      verified: boolean;
      loanPromise?: LoanPromise;
      bank?: string;
    };
  };
  
  // Relationer
  relations: {
    sellingObjects: ObjectReference[];
    buyingObjects: ObjectReference[];
    interestedInObjects: ObjectReference[];
  };
  
  // CRM
  leadSource?: string;
  lastContact?: Date;
  notes: Note[];
  activities: Activity[];
}
```

## Arbetsflöden

### Spekulantlivscykel
1. **Lead** → Första kontakt/intresse
2. **Intresserad** → Aktiv spekulant
3. **Visningsdeltagare** → Har sett objektet
4. **Budgivare** → Har lagt bud
5. **Köpare** → Vunnit budgivning
6. **Avböjt** → Inte längre intresserad

### Budgivningsprocess
1. Verifiera finansiering
2. Registrera bud
3. Kommunicera med alla parter
4. Uppdatera budlista
5. Hantera motbud
6. Slutföra affär

## Förbättringsförslag för Mäklarsystem

### 1. Avancerad spekulanthantering
- **Lead scoring** - Automatisk poängsättning av spekulanter
- **Automatiska påminnelser** - För uppföljning
- **Bulk-åtgärder** - Hantera flera spekulanter samtidigt
- **Spekulantmatchning** - AI-baserad matchning mot objekt

### 2. Kommunikationsintegration
- **SMS/Email-mallar** - Fördefinierade meddelanden
- **Automatiska bekräftelser** - Vid visningsbokning
- **Gruppmeddelanden** - Till alla spekulanter
- **Kommunikationslogg** - Komplett historik

### 3. Budgivningsförbättringar
- **Digital budgivning** - Online budläggning
- **Automatisk ranking** - Baserat på finansiering
- **Budgivningsprotokoll** - PDF-generering
- **Transparens-dashboard** - För öppen budgivning

### 4. Analysverktyg
- **Konverteringsgrad** - Lead till köpare
- **Visningsstatistik** - Deltagande och konvertering
- **Spekulantbeteende** - Mönster och preferenser
- **ROI per leadkälla** - Effektivitetsmätning