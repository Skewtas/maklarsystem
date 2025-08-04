# Validation System

Detta dokument beskriver valideringssystemet som följer DRY-principen genom centraliserade enums och återanvändbara partial schemas.

## Struktur

```
validation/
├── schemas/
│   ├── partials/           # Återanvändbara schema-delar
│   │   ├── kontakt.partial.ts
│   │   └── objekt.partial.ts
│   ├── common.schema.ts    # Gemensamma validerings-schemas
│   ├── kontakter.schema.ts # Kontakt-specifika schemas
│   └── objekt.schema.ts    # Objekt-specifika schemas
└── validators/             # Anpassade validatorer
```

## Enums (src/lib/enums/)

Alla enums är centraliserade för att följa DRY-principen:

### Gemensamma Enums (`common.enums.ts`)
- `STATUS_VALUES` - Status för olika entiteter
- `ENERGY_CLASS_VALUES` - Energiklasser
- `STANDARD_NIVA_VALUES` - Standardnivåer för fastigheter
- `LADDBOX_TYP_VALUES` - Laddbox-typer

### Kontakt Enums (`kontakt.enums.ts`)
- `KONTAKT_TYP_VALUES` - Kontakttyper (privatperson, företag)
- `KONTAKT_KATEGORI_VALUES` - Kontaktkategorier

### Objekt Enums (`objekt.enums.ts`)
- `OBJEKT_TYP_VALUES` - Objekttyper (villa, lägenhet, etc.)
- `OBJEKT_UNDERTYP_VALUES` - Objekt-undertyper
- `AGARE_TYP_VALUES` - Ägartyper
- Plus många fler specifika för fastigheter

## Partial Schemas

Partial schemas möjliggör återanvändning av schema-delar:

### Kontakt Partials (`partials/kontakt.partial.ts`)
- `baseKontaktPartialSchema` - Grundläggande kontaktfält
- `privatpersonPartialSchema` - Privatperson-specifika fält
- `foretagPartialSchema` - Företag-specifika fält
- `kontaktUpdatePartialSchema` - För uppdateringar
- `kontaktFilterPartialSchema` - För filtrering

### Objekt Partials (`partials/objekt.partial.ts`)
- `baseObjektPartialSchema` - Grundläggande objektfält
- `optionalObjektPartialSchema` - Valfria grundfält
- `priority1ObjektPartialSchema` - Prioritet 1 fält
- `priority2ObjektPartialSchema` - Prioritet 2 fält
- `ownershipObjektPartialSchema` - Ägarskap
- `pricingObjektPartialSchema` - Prissättning
- `featuresObjektPartialSchema` - Fastighetsfunktioner
- `technicalObjektPartialSchema` - Teknisk information
- `financialObjektPartialSchema` - Finansiell information
- `locationObjektPartialSchema` - Platsinformation

## Användning

### Importera Enums
```typescript
import { STATUS_VALUES, KONTAKT_TYP_VALUES } from '@/lib/enums'
```

### Använda Partial Schemas
```typescript
import { baseKontaktPartialSchema } from '@/lib/validation/schemas/partials/kontakt.partial'

// Bygg anpassade schemas
const customSchema = baseKontaktPartialSchema.extend({
  customField: z.string()
})
```

### Använda Fullständiga Schemas
```typescript
import { kontaktCreateSchema, objektCreateSchema } from '@/lib/validation/schemas'

// Validera data
const result = kontaktCreateSchema.parse(inputData)
```

## Fördelar

1. **DRY (Don't Repeat Yourself)** - Inga duplicerade enums eller schemas
2. **Type Safety** - TypeScript const assertions för alla enums
3. **Återanvändbarhet** - Partial schemas kan kombineras flexibelt
4. **Maintainability** - Centraliserade definitioner, lättare att underhålla
5. **Konsistens** - Samma validering används överallt

## Migration

Alla befintliga imports kommer att fungera tack vare re-exports i huvudschema-filerna. Detta säkerställer bakåtkompatibilitet medan systemet gradvis kan migreras till den nya strukturen.