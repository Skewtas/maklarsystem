# Svenska Valideringstester

Omfattande enhetstester för svenska valideringsfunktioner med Jest.

## Översikt

Denna testsvit innehåller 121 tester som validerar svenska identifikatorer och format med hög testtäckning (98.47% statements, 96.61% branch coverage).

## Testfiler

### `personnummer.test.ts`
Testar svenska personnummer-validering enligt officiella regler:
- **27 tester** för personnummer-validering och formatering
- **Luhn-algoritm** kontrollsiffra-validering  
- **Datumvalidering** inklusive skottår och samordningsnummer
- **Format-stöd**: 10/12-siffror, bindestreck, mellanslag
- **Edge cases**: Århundradesgränser, extrema datum

### `organisationsnummer.test.ts`
Testar svenska organisationsnummer-validering:
- **25 tester** för organisationsnummer-validering och formatering
- **Organisationstyper**: Statliga (2), kommunala (3), aktiebolag (5), etc.
- **Luhn-algoritm** för kontrollsiffror
- **Format-stöd**: Bindestreck, mellanslag
- **Valideringsregler**: Första siffra 2-9, 10 siffror totalt

### `fastighetsbeteckning.test.ts`
Testar svenska fastighetsbeteckningar:
- **33 tester** för fastighetsbeteckning-validering och formatering
- **Format**: "KOMMUN TRAKT BLOCK:ENHET" eller "KOMMUN TRAKT BLOCK:ENHET:UNDERENHET"
- **Svenska tecken**: Åäö-stöd i kommunnamn
- **Validering**: Numeriska block/enheter, inga negativa värden

### `swedish-extras.test.ts`
Testar övriga svenska valideringar:
- **36 tester** för postnummer och telefonnummer
- **Postnummer**: 5 siffror, 10000-99999, formatering med mellanslag
- **Telefonnummer**: Mobil (07X), fastnät, internationellt (+46), formatering
- **Edge cases**: Olika format-kombinationer

## Testkategorier

### Giltiga Input-tester
- Standardformat och variationer
- Officiella testidentifikatorer
- Edge cases och extremvärden
- Olika formatering (bindestreck, mellanslag)

### Ogiltiga Input-tester
- Tomma/null värden
- Fel längd eller format
- Ogiltiga kontrollsiffror
- Icke-numeriska tecken
- Ogiltiga datum/värden

### Formaterings-tester
- Automatisk formattering till standardformat
- Bevarande av redan korrekt formaterade värden
- Hantering av ogiltiga format
- Null/undefined-hantering

### Edge Case-tester
- Gränsvärden och extrema input
- Århundradesgränser för korta format
- Skottår och specialdatum
- Svenska tecken och specialfall

## Körning av Tester

```bash
# Alla svenska valideringstester
npm test -- --testPathPattern="validators/__tests__"

# Specifika tester
npm test -- --testPathPattern="personnummer"
npm test -- --testPathPattern="organisationsnummer"
npm test -- --testPathPattern="fastighetsbeteckning"
npm test -- --testPathPattern="swedish-extras"

# Med coverage-rapport
npm run test:coverage -- --testPathPattern="validators/__tests__"
```

## Testdata

Testerna använder:
- **Riktiga testpersonnummer** från svenska myndigheter
- **Genererade giltiga nummer** med korrekt Luhn-kontrollsiffra
- **Kända organisationsnummer** för olika organisationstyper
- **Representativa fastighetsbeteckningar** från svenska kommuner

## Testtäckning

- **Statements**: 98.47%
- **Branches**: 96.61%
- **Functions**: 100%
- **Lines**: 98.33%

## Svenska Valideringsregler

### Personnummer
- Format: YYYYMMDD-XXXX eller YYMMDD-XXXX
- Luhn-algoritm för kontrollsiffra
- Datumvalidering med skottårshantering
- Samordningsnummer (dag + 60)

### Organisationsnummer
- Format: XXXXXX-XXXX (10 siffror)
- Första siffra 2-9 (organisationstyp)
- Luhn-algoritm för kontrollsiffra

### Fastighetsbeteckning
- Format: "KOMMUN TRAKT BLOCK:ENHET[:UNDERENHET]"
- Svenska tecken i kommunnamn
- Numeriska block/enheter (positiva)

### Postnummer
- Format: XXX XX (5 siffror)
- Intervall: 10000-99999

### Telefonnummer
- Format: 0XXXXXXXXX eller +46XXXXXXXXX
- Mobil: 07X-XXXXXXX
- Fastnät: Olika områdeskoder
- 9-10 siffror totalt (exkl. landskod)