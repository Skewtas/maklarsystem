# Vitec Express - Objektdetalj - Affären-fliken

## Översikt
Affären-fliken är den mest omfattande fliken som hanterar alla affärsrelaterade aspekter av objektförsäljningen, från uppdrag till tillträde och provision. Den har 8 huvudsektioner med detaljerad information om hela försäljningsprocessen.

## Huvudsektioner (scrollbar navigation)

### 1. Uppdraget
Grundläggande uppdragsinformation:

**Fält:**
- **Intagskälla** - Dropdown (Gustav i exemplet)
- **Objektet upplagt** - Datum (2024-07-05)
- **Uppdragstyp** - Dropdown (Försäljning)
- **Status** - Dropdown (Till salu)
- **Ansvarig mäklare** - Textfält med dropdown (Rani Shakir - MatchaHem)
- **Extra kontaktperson** - Textfält
- **Objektnummer** - Textfält (RS052)
- **Uppdragsdatum** - Datum (2024-08-17)
- **Offert lämnad** - Datum (2024-08-16)
- **Försäljningssätt** - Dropdown
- **Prognos för säljstart** - Datum
- **Anteckning till prognos** - Textfält (0 av 50)
- **Känslig affär** - Kryssruta

### 2. Kontraktskrivning
Information om var och när kontrakt skrivs:

**Fält:**
- **Kontraktsdatum** - Datum
- **Kontraktstid** - Tid
- **Plats** - Radioalternativ:
  - Kontor (valt)
  - Annan plats
- **Kontor** - Dropdown (MatchaHem Fastighetsförmedling AB)
- **Adress** - Textfält (Rissneleden 134 G)

### 3. Pris
Prisinformation och valuta:

**Fält:**
- **Utgångspris (kr)** - Numeriskt fält
- **Slutpris (kr)** - Numeriskt fält
- **Pris i annan valuta (kr)** - Numeriskt fält
- **Annan valuta** - Dropdown (inaktiverad)
- **Pristext** - Textfält med dropdown (0 av 50)

### 4. Villkor
Kontraktsvillkor:

**Fält:**
- **Köparen godkänd av föreningen** - Datum
- **Lånevillkor finns** - Dropdown (Ej angivit)
- **Alla avtalsvillkor uppfyllda** - Datum

### 5. Tillträde
Omfattande tillträdesinformation:

**Fält:**
- **Tambur - skapa ärende** - Knapp för integration
- **Tillträdesdatum** - Datum
- **Tillträdestid** - Tid
- **Möjligt tillträdesdatum** - Textfält (0 av 100)
- **Klar för tillträde** - Kryssruta
- **Köparens bank** - Dropdown
- **Intern Anteckning** - Textområde

**Plats för tillträde:**
- Kontor (valt)
- Bank
- Annan plats
- **Adress** - Textfält (Rissneleden 134 G)
- **E-post** - Textfält (Rani.Shakir@matchahem.se)
- **Telefon** - Textfält (0762586389)

### 6. Provision och extra kostnader
Detaljerad provisionshantering:

**Provisionstyp (radioalternativ):**
- Fast arvode
- Provision
- Provisionstrappa

**Provisionsfält:**
- **Grundarvode (kr)** - Numeriskt
- **Provision (%)** - Numeriskt (upp till 3 nivåer)
- **Från pris (kr)** - Numeriskt (för varje nivå)
- **Dock lägst (kr)** - Numeriskt
- **Ovan angiven provision är inklusive moms** - Kryssruta (markerad)

**Beräknad provision:**
- Summa provision/arvode: 59 000 kr - inklusive moms

**Tillägg/Avdrag:**
- **Beskrivning** - Textfält (0 av 50)
- **Kategori** - Dropdown
- **Belopp (ink. moms) (kr)** - Numeriskt
- **Moms (%)** - Numeriskt

**Provisionsfördelning:**
- Visar mäklare och deras procentandel (100% till Rani Shakir)
- Möjlighet att dela provision med andra

**Summering:**
- Provision: 59 000 kr (Varav moms 11 800 kr)
- Tillägg/avdrag: 0 kr
- Summa: 59 000 kr

**Provision Erhållen den** - Datum

### 7. Handpenning
Hantering av handpenning:

**Fält:**
- **Belopp (kr)** - Numeriskt
- **Ränta (kr)** - Numeriskt
- **Deponeras hos mäklaren** - Kryssruta
- **Erläggs** - Datum
- **Erlagd** - Datum
- **Redovisad** - Datum
- **Redovisas till säljaren** - Kryssruta

### 8. Betalning
Betalningsinformation:

**Fält:**
- **Dellikvid (kr)** - Numeriskt
- **Dellikvid erlagd** - Datum
- **Kontant på tillträdesdagen** - 0 kr (beräknat)
- **Köpeskilling** - 0 kr (beräknat)

## Tekniska observationer

### UI/UX Patterns
1. **Scrollbar navigation** - Snabb navigering mellan sektioner
2. **Spara-knapp** - Överst på sidan (inaktiverad tills ändringar)
3. **Villkorlig visning** - Fält visas/döljs baserat på val
4. **Automatiska beräkningar** - Provision och betalningar
5. **Dropdown-integrationer** - Fördefinierade val

### Datastruktur
```typescript
interface Affar {
  // Uppdraget
  uppdrag: {
    intagskalla: string;
    objektUpplagt: Date;
    uppdragstyp: 'Försäljning' | 'Värdering' | 'Förmedling';
    status: 'Till salu' | 'Såld' | 'Avvaktande';
    ansvarigMaklare: User;
    extraKontaktperson?: User;
    objektnummer: string;
    uppdragsdatum: Date;
    offertLamnad?: Date;
    forsaljningssatt?: string;
    prognosSaljstart?: Date;
    prognosAnteckning?: string;
    kansligAffar: boolean;
  };
  
  // Kontraktskrivning
  kontrakt: {
    datum?: Date;
    tid?: string;
    plats: 'kontor' | 'annanPlats';
    kontorInfo?: Office;
    adress: string;
  };
  
  // Pris
  pris: {
    utgangspris?: number;
    slutpris?: number;
    annanValuta?: {
      belopp: number;
      valuta: string;
    };
    pristext?: string;
  };
  
  // Provision
  provision: {
    typ: 'fast' | 'procent' | 'trappa';
    grundarvode?: number;
    provisionsniva: ProvisionLevel[];
    dockLagst?: number;
    inklusiveMoms: boolean;
    tillagg: ProvisionTillagg[];
    fordelning: ProvisionFordelning[];
    erhallen?: Date;
  };
  
  // Tillträde
  tilltrade: {
    datum?: Date;
    tid?: string;
    mojligtDatum?: string;
    klarForTilltrade: boolean;
    koparensBank?: string;
    internAnteckning?: string;
    plats: PlatsInfo;
  };
  
  // Handpenning
  handpenning: {
    belopp?: number;
    ranta?: number;
    deponerasHosMaklare: boolean;
    erlaggs?: Date;
    erlagd?: Date;
    redovisad?: Date;
    redovisasTillSaljare: boolean;
  };
  
  // Betalning
  betalning: {
    dellikvid?: number;
    dellikvidErlagd?: Date;
    kontantTilltrade: number;
    kopeskilling: number;
  };
}
```

## Arbetsflöden

### Affärslivscykel
1. **Uppdrag** - Initial setup och avtal
2. **Marknadsföring** - Till salu period
3. **Kontraktsskrivning** - När köpare hittats
4. **Villkorsuppfyllelse** - Kontrollera alla villkor
5. **Tillträde** - Överlämnande av bostaden
6. **Avslut** - Provision och slutredovisning

## Förbättringsförslag för Mäklarsystem

### 1. Automatisering
- **Dokumentgenerering** - Automatiska kontrakt från data
- **Provisionsberäkning** - Realtidsuppdatering
- **Villkorsbevakning** - Automatiska påminnelser
- **Integration med banker** - För handpenning/tillträde

### 2. Validering och kontroller
- **Obligatoriska fält** - Före statusändring
- **Logiska kontroller** - Datum i rätt ordning
- **Provisionsvalidering** - Kontroll mot avtal
- **Villkorsuppföljning** - Checklistor

### 3. Kommunikation
- **Automatiska meddelanden** - Vid statusändringar
- **Påminnelser** - För viktiga datum
- **Dokumentdelning** - Säker portal för parter
- **Signering** - Digital signering av dokument