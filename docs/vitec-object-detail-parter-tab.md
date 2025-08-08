# Vitec Express - Objektdetalj - Parter-fliken

## Översikt
Parter-fliken hanterar alla parter involverade i objektaffären, främst säljare och köpare. Den visar kontaktinformation, ägarandelar och möjliggör kommunikation med parterna.

## Huvudfunktioner

### Toppnavigering (Åtgärdsknappar)
1. **Skicka e-post** - Skicka email till valda parter
2. **Skicka SMS** - Skicka SMS till valda parter
3. **Lägg till i ringlista** - Lägg till parter i ringlista för uppföljning
4. **Ny part** - Lägg till ny part (+-knapp)

### Partkategorier

#### Säljare
I exemplet visas två säljare:

**1. Seyfi Dogan (Primär)**
- Status: Primär säljare
- Telefon: 0700922607
- Andel: 1/2 (50% ägande)
- Kryssruta för val
- Redigeringsknapp

**2. Sara Dogan**
- Telefon: (visas inte nummer)
- Andel: 1/2 (50% ägande)
- Kryssruta för val
- Redigeringsknapp

### Partinformation som visas
- **Namn** - Fullständigt namn
- **Roll** - Primär/Sekundär
- **Kontaktuppgifter** - Telefon, email (om tillgängligt)
- **Ägarandel** - Del av ägandet (t.ex. 1/2, 1/3)

## Förväntade partkategorier (baserat på branschstandard)

### 1. Säljare
- Nuvarande ägare
- Dödsbo/Arvingar
- Företag
- Fullmaktshavare

### 2. Köpare
- Spekulanter som vunnit budgivning
- Medköpare
- Företagsköpare

### 3. Övriga parter
- Juridiska ombud
- Fullmaktshavare
- Panthavare
- Förvaltare

## Tekniska observationer

### UI/UX Patterns
1. **Kortbaserad layout** - Varje part visas som ett kort
2. **Expanderbar sektion** - Säljare-sektionen kan expanderas/kollapsas
3. **Batch-åtgärder** - Välj flera parter för gruppåtgärder
4. **Inline-redigering** - Redigera partinformation direkt
5. **Visuell hierarki** - Primär part markeras tydligt

### Datastruktur
```typescript
interface Party {
  id: string;
  type: 'seller' | 'buyer' | 'other';
  role: 'primary' | 'secondary' | 'representative';
  
  // Personuppgifter
  person: {
    firstName: string;
    lastName: string;
    personalNumber?: string;
    address?: Address;
  };
  
  // Kontakt
  contact: {
    phone?: string;
    email?: string;
    preferredContact: 'phone' | 'email' | 'sms';
  };
  
  // Ägarskap
  ownership: {
    share: string; // "1/2", "1/3", etc.
    percentage: number; // 50, 33.33, etc.
    registeredOwner: boolean;
  };
  
  // Representation
  representation?: {
    type: 'self' | 'power_of_attorney' | 'legal_guardian';
    representative?: Party;
    document?: Document;
  };
  
  // Status
  status: {
    verified: boolean;
    signedContract: boolean;
    agreedToTerms: boolean;
  };
}
```

## Arbetsflöden

### Parthantering
1. **Identifiering** - Verifiera parternas identitet
2. **Dokumentation** - Samla nödvändiga dokument
3. **Kommunikation** - Håll kontakt genom processen
4. **Avtalsskrivning** - Hantera kontraktsskrivning
5. **Slutförande** - Genomför överlåtelse

### Kommunikationsflöde
1. **Initial kontakt** - Första mötet/samtalet
2. **Informationsutbyte** - Dela objektinformation
3. **Förhandling** - Hantera villkor och pris
4. **Bekräftelser** - Skriftliga överenskommelser
5. **Uppföljning** - Post-försäljning

## Förbättringsförslag för Mäklarsystem

### 1. Avancerad parthantering
- **BankID-verifiering** - Digital identifiering
- **Automatisk folkbokföring** - Hämta adressuppgifter
- **Ägandehistorik** - Spåra tidigare ägare
- **Familjerelationer** - Hantera arvskiften

### 2. Kommunikationsförbättringar
```typescript
interface CommunicationEnhancements {
  // Mallar
  templates: {
    welcomeLetter: Template;
    contractDraft: Template;
    completionNotice: Template;
  };
  
  // Automation
  automatedReminders: boolean;
  statusUpdates: boolean;
  
  // Tracking
  communicationLog: CommunicationEntry[];
  readReceipts: boolean;
  responseTracking: boolean;
}
```

### 3. Dokumenthantering
- **Digital signering** - BankID/e-legitimation
- **Automatisk ifyllning** - Från partdata
- **Dokumentspårning** - Vem har signerat vad
- **Arkivering** - Säker långtidslagring

### 4. Integrationsmöjligheter
- **Folkbokföring** - Skatteverket API
- **Företagsregister** - Bolagsverket
- **Kreditupplysning** - UC/Creditsafe
- **Banker** - För lånelöften

### 5. Säkerhet och compliance
- **GDPR-hantering** - Samtycken och rättigheter
- **Audit trail** - All aktivitet loggas
- **Behörighetskontroll** - Vem ser vad
- **Kryptering** - Känslig data skyddas