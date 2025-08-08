# Vitec Express - Objektdetalj - Lån och Pant-fliken

## Översikt
Lån och Pant-fliken hanterar information om befintliga lån och pantbrev kopplade till objektet. Detta är kritisk information för att förstå objektets ekonomiska belastning och för att hantera överlåtelsen korrekt.

## Huvudfunktioner

### Toppnavigering
1. **Lista/Kort** - Växla mellan list- och kortvy
2. **Tambur - skapa ärende** - Integration med Tambur-systemet
3. **Nytt lån** - Lägg till ny låneinformation (+-knapp)

### Huvudinnehåll

#### Lånöversikt
I exemplet visas: "Inga lån eller pantbrev inlagda här än"

Detta indikerar att:
- Inga befintliga lån är registrerade
- Inga pantbrev är kopplade till objektet

#### Pant-sektion
- **Rubrik**: "Pant" med expanderbar pil
- **Status**: "Bostadsrätten är inte pantsatt"
- **Åtgärd**: Redigeringsknapp för att uppdatera pantinformation

#### Anteckningar
- **Textfält** för interna anteckningar om lån och pant
- **Spara-knapp** (inaktiverad tills ändringar görs)

## Förväntad funktionalitet när lån finns

### Låninformation som skulle visas:
1. **Långivare** - Bank eller kreditinstitut
2. **Lånenummer** - Unikt identifieringsnummer
3. **Lånebelopp** - Ursprungligt och kvarvarande
4. **Ränta** - Aktuell räntesats
5. **Bindningstid** - När lånet kan lösas
6. **Månadsbetalning** - Amortering och ränta
7. **Säkerhet** - Typ av säkerhet (pantbrev etc.)

### Pantbrevsinformation:
1. **Pantbrevsnummer** - Officiellt registreringsnummer
2. **Belopp** - Pantbrevets värde
3. **Prioritet** - Ordning i förmånsrätt
4. **Innehavare** - Vem som har pantbrevet
5. **Digitalt/Fysiskt** - Format på pantbrevet

## Tekniska observationer

### UI/UX Patterns
1. **Vyväxling** - Lista eller kortvy för översikt
2. **Tom vy** - Tydlig indikation när inga lån finns
3. **Expanderbara sektioner** - För detaljerad information
4. **Integration** - Koppling till externa system (Tambur)
5. **Anteckningsfält** - För kompletterande information

### Datastruktur
```typescript
interface LoanAndMortgage {
  objectId: string;
  
  // Lån
  loans: Loan[];
  
  // Pantbrev
  mortgageDeeds: MortgageDeed[];
  
  // Pantsättning
  pledges: Pledge[];
  
  // Anteckningar
  notes: {
    internal: string;
    lastUpdated: Date;
    updatedBy: User;
  };
}

interface Loan {
  id: string;
  
  // Långivare
  lender: {
    name: string;
    type: 'bank' | 'finance_company' | 'private';
    contactPerson?: string;
    phone?: string;
  };
  
  // Lånedetaljer
  details: {
    loanNumber: string;
    originalAmount: number;
    remainingAmount: number;
    startDate: Date;
    endDate?: Date;
  };
  
  // Villkor
  terms: {
    interestRate: number;
    interestType: 'fixed' | 'variable';
    bindingPeriod?: Date;
    amortization: number;
    monthlyPayment: number;
  };
  
  // Säkerhet
  security: {
    type: 'mortgage_deed' | 'pledge' | 'guarantee';
    mortgageDeedIds?: string[];
    value: number;
  };
  
  // Status
  status: {
    active: boolean;
    transferable: boolean;
    earlyRepaymentFee?: number;
  };
}

interface MortgageDeed {
  id: string;
  
  // Grunddata
  registration: {
    number: string;
    date: Date;
    authority: string;
    digitalId?: string;
  };
  
  // Värde
  value: {
    amount: number;
    currency: 'SEK';
    priority: number;
  };
  
  // Innehav
  possession: {
    holder: 'owner' | 'bank' | 'other';
    holderName?: string;
    location?: 'digital' | 'physical';
  };
  
  // Status
  status: {
    active: boolean;
    pledged: boolean;
    pledgedTo?: string;
  };
}

interface Pledge {
  id: string;
  mortgageDeedId: string;
  
  // Pantsättning
  pledge: {
    creditor: string;
    amount: number;
    date: Date;
    purpose: string;
  };
  
  // Villkor
  terms: {
    releasable: boolean;
    conditions?: string;
    endDate?: Date;
  };
}
```

## Arbetsflöden

### Lånhantering vid försäljning
1. **Inventering** - Lista alla befintliga lån
2. **Kontakt med långivare** - Få lösenbesked
3. **Beräkning** - Kalkylera återbetalningsbelopp
4. **Information till köpare** - Övertagbara lån?
5. **Lösen vid tillträde** - Hantera återbetalning
6. **Pantbrevshantering** - Överföring till ny ägare

### Pantbrevsprocess
1. **Kontroll** - Verifiera alla pantbrev
2. **Lokalisering** - Var finns pantbreven?
3. **Friläggning** - Lösa ut från bank vid behov
4. **Överföring** - Till köparens bank
5. **Registrering** - Uppdatera Lantmäteriet

## Förbättringsförslag för Mäklarsystem

### 1. Automatisk lånhämtning
```typescript
interface AutomatedLoanFetching {
  // Bankintegration
  bankAPIs: {
    connect: (bank: string, credentials: Credentials) => Promise<Loan[]>;
    fetchLoanDetails: (loanNumber: string) => Promise<LoanDetails>;
    getPayoffAmount: (loanId: string, date: Date) => Promise<number>;
  };
  
  // Lantmäteriet integration
  landRegistry: {
    fetchMortgageDeeds: (propertyId: string) => Promise<MortgageDeed[]>;
    verifyOwnership: (propertyId: string) => Promise<boolean>;
    checkEncumbrances: (propertyId: string) => Promise<Encumbrance[]>;
  };
  
  // Kalkylering
  calculations: {
    totalDebt: () => number;
    monthlyPayments: () => number;
    earlyRepaymentCosts: () => number;
    netProceeds: (salePrice: number) => number;
  };
}
```

### 2. Digital pantbrevshantering
- **E-pantbrev** - Full digital hantering
- **Spårning** - Realtidsstatus på pantbrev
- **Automatisk överföring** - Vid tillträde
- **Säker förvaring** - Digital säkerhetslösning

### 3. Lånövertagande
- **Kreditprövning** - Direkt i systemet
- **Jämförelse** - Olika lånealternativ
- **Ansökan** - Integrerad låneansökan
- **Godkännande** - Snabb beslutsprocess

### 4. Visualization och rapporter
- **Lånöversikt** - Grafisk presentation
- **Tidslinje** - Viktiga datum och deadlines
- **Kostnadsanalys** - Total kostnad vid olika scenarion
- **Exportfunktion** - PDF/Excel för köpare

### 5. Riskhantering
- **Varningar** - För bindningstider och avgifter
- **Checklistor** - Säkerställ korrekt hantering
- **Dokumentation** - Automatisk loggning
- **Compliance** - Regelefterlevnad