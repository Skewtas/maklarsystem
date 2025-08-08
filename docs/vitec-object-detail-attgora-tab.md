# Vitec Express - Objektdetalj - Att göra-fliken

## Översikt
Att göra-fliken i objektdetaljvyn visar uppgifter specifikt kopplade till det aktuella objektet. Detta skiljer sig från den globala "Att göra"-modulen genom att endast visa uppgifter relaterade till detta specifika objekt.

## Huvudfunktioner

### Toppnavigering
1. **Markera flera** - Aktivera flervals-läge för bulkåtgärder

### Uppgiftskategorier

#### 1. Att göra (Aktiva uppgifter)
Visar alla pågående uppgifter för objektet:

**Lägg till ny uppgift:**
- Textfält för att snabbt lägga till nya uppgifter
- Lägg till-knapp (inaktiverad tills text skrivs in)

**Exempel på uppgifter (5 visade + 27 ytterligare):**
1. **Energideklaration - Kontroll och information**
2. **Bouppteckning - Inhämtad**
3. **Uppdragsavtal - Utanför kontoret**
4. **Uppdragsavtal - Utanför kontoret påbörjas omgående**
5. **Energideklaration - Inhämtad**

Varje uppgift har:
- Kryssruta för att markera som klar
- Uppgiftstext med kategori och beskrivning
- Möjlighet att expandera för mer information

#### 2. Klart
Visar slutförda uppgifter:

**Exempel på slutförda uppgifter (6 visade + 8 ytterligare):**
1. **Inledande kontakt - Med uppdragsgivaren** (Utförd den 17 aug 2024)
2. **Kundmöte - Intagsbesiktning** (Utförd den 17 aug 2024)
3. **Utgångspris - Diskussion och rådgivning** (Utförd den 17 aug 2024)
4. **Marknadsplan - Diskussion** (Utförd den 17 aug 2024)
5. **Arbetssätt - Information** (Utförd den 17 aug 2024)
6. **Sidotjänster - Information** (Utförd den 17 aug 2024)

#### 3. Ej aktuellt
Sektion för uppgifter som inte längre är relevanta (tom i exemplet).

## Uppgiftskategorier som observerats

### Dokumenthantering
- **Energideklaration** - Kontroll, inhämtning, information
- **Bouppteckning** - Inhämtning vid dödsbo
- **Uppdragsavtal** - Signering och hantering

### Kundkommunikation
- **Inledande kontakt** - Första kontakten med säljare
- **Kundmöte** - Olika typer av möten
- **Information** - Om arbetssätt, sidotjänster etc.

### Affärsprocessen
- **Utgångspris** - Diskussion och rådgivning
- **Marknadsplan** - Planering av marknadsföring
- **Besiktning** - Intagsbesiktning av objektet

## Tekniska observationer

### UI/UX Patterns
1. **Kategoriserad lista** - Tydlig uppdelning i status
2. **Inline-tillägg** - Snabb uppgiftsskapande
3. **Kryssrutor** - Enkel markering som klar
4. **Expanderbar information** - "Ytterligare X uppgifter"
5. **Datumstämplar** - Spårbarhet för slutförda uppgifter

### Datastruktur
```typescript
interface ObjectTask {
  id: string;
  objectId: string;
  
  // Uppgiftsinformation
  task: {
    title: string;
    category: TaskCategory;
    description: string;
    priority: 'high' | 'medium' | 'low';
  };
  
  // Status
  status: {
    state: 'todo' | 'completed' | 'not_relevant';
    completedDate?: Date;
    completedBy?: User;
  };
  
  // Kopplingar
  relations: {
    documentIds?: string[];
    contactIds?: string[];
    viewingIds?: string[];
    milestoneId?: string;
  };
  
  // Påminnelser
  reminders: {
    dueDate?: Date;
    reminderDate?: Date;
    recurring?: RecurrencePattern;
  };
  
  // Metadata
  metadata: {
    createdDate: Date;
    createdBy: User;
    lastModified: Date;
    notes?: string;
  };
}

type TaskCategory = 
  | 'documentation'      // Energideklaration, bouppteckning etc.
  | 'customer_contact'   // Möten, samtal, information
  | 'legal'             // Avtal, juridiska dokument
  | 'marketing'         // Fotografering, annonsering
  | 'financial'         // Värdering, lån, ekonomi
  | 'inspection'        // Besiktningar
  | 'administrative'    // Allmän administration
  | 'viewing'           // Visningsrelaterat
  | 'handover';         // Tillträde och överlämning
```

## Arbetsflöden

### Uppgiftslivscykel
1. **Skapande** - Automatiskt eller manuellt
2. **Tilldelning** - Till ansvarig mäklare
3. **Påminnelse** - Notifikationer vid förfallodatum
4. **Genomförande** - Utför uppgiften
5. **Markering** - Kryssa som klar
6. **Arkivering** - Flyttas till "Klart"

### Automatiska uppgifter
Systemet verkar skapa uppgifter automatiskt baserat på:
- **Objekttyp** - Olika för villa, bostadsrätt, etc.
- **Säljarsituation** - Extra uppgifter vid dödsbo
- **Regelkrav** - Energideklaration är obligatorisk
- **Processsteg** - Uppgifter för varje fas

## Förbättringsförslag för Mäklarsystem

### 1. Intelligent uppgiftshantering
```typescript
interface SmartTaskManagement {
  // AI-driven
  autoGeneration: {
    templateBased: boolean;
    contextAware: boolean;
    learningEnabled: boolean;
  };
  
  // Prioritering
  prioritization: {
    urgencyScore: number;
    impactAnalysis: boolean;
    dependencyAware: boolean;
  };
  
  // Automation
  automation: {
    recurringTasks: boolean;
    conditionalTasks: boolean;
    bulkOperations: boolean;
  };
  
  // Integration
  integration: {
    calendarSync: boolean;
    emailReminders: boolean;
    mobileNotifications: boolean;
  };
}
```

### 2. Uppgiftsmallar
- **Objekttypspecifika** - Villa, BR, tomt etc.
- **Situationsbaserade** - Dödsbo, skilsmässa etc.
- **Säsongsanpassade** - Vinteruppgifter, sommar etc.
- **Regeluppdaterade** - Alltid aktuella krav

### 3. Samarbetsfunktioner
- **Delegering** - Till assistenter eller kollegor
- **Kommentarer** - Diskussion kring uppgifter
- **Fildelning** - Bifoga relevanta dokument
- **Statusuppdateringar** - Realtidssynkning

### 4. Analysverktyg
- **Genomförandetid** - Hur lång tid tar uppgifter?
- **Flaskhalsar** - Var fastnar processen?
- **Effektivitet** - Jämför med branschstandard
- **Förbättringsförslag** - AI-baserade tips

### 5. Mobil integration
- **Checklista-app** - För visningar och möten
- **Offline-stöd** - Fungerar utan nätverk
- **Röstnoteringar** - Lägg till uppgifter med tal
- **Platsbaserade påminnelser** - Vid objektbesök