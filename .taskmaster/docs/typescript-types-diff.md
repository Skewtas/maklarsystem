# TypeScript Types Update for database.ts

## New Fields to Add to Objekt Interface

Add these fields to the `objekt` table type definitions in all three interfaces (Row, Insert, Update):

### Priority 1 - Essential Fields
```typescript
// Official property designation
fastighetsbeteckning: string | null

// More specific property sub-type
undertyp: 'parhus' | 'kedjehus' | 'radhus_mellan' | 'radhus_gavelbostad' | 'enplansvilla' | 'tvåplansvilla' | 'souterrangvilla' | 'sluttningshus' | 'atriumhus' | 'funkisvilla' | 'herrgård' | 'torp' | 'sjötomt' | 'skogstomt' | 'åkertomt' | null

// Share percentage in housing cooperative
andel_i_forening: number | null

// Share ratio for cost distribution
andelstal: number | null

// Virtual tour URL
virtuell_visning_url: string | null
```

### Priority 2 - Valuable Fields
```typescript
// Living cost calculation URL
boendekalkyl_url: string | null

// Property standard level
standard_niva: 'hög' | 'mycket_hög' | 'normal' | 'låg' | 'renovering_behövs' | 'totalrenovering_krävs' | null

// Accessibility
tillganglighetsanpassad: boolean | null

// Modern amenities
laddbox: boolean | null
solceller: boolean | null
solceller_kapacitet_kwp: number | null
laddbox_typ: '1-fas_3.7kW' | '3-fas_11kW' | '3-fas_22kW' | 'dc_snabbladdare' | null
laddbox_antal: number | null
```

### Priority 3 - Additional Fields

#### Financial
```typescript
lagfartskostnad: number | null
stampelskatt: number | null
overlatelseavgift: number | null
skulder_forening: number | null
ekonomisk_plan_url: string | null
```

#### Technical
```typescript
grundlaggning: 'platta' | 'källare' | 'krypgrund' | 'torpargrund' | 'pålar' | null
bjalkllag: string | null
stomme: string | null
planlosning_typ: 'öppen' | 'traditionell' | 'genomgående' | 'enfilade' | 'flexibel' | null
takhojd: number | null
```

#### Services
```typescript
sophamtning: string | null
snorojning: string | null
el_abonnemang: string | null
forsakringsbolag: string | null
hemforsakring_ingar: boolean | null
```

#### Legal
```typescript
pantsatt: boolean | null
inteckningar: string | null
forkopsratt: string | null
hembudsklausul: string | null
andrahandsuthyrning_tillaten: boolean | null
```

#### Marketing
```typescript
dronarvideo_url: string | null
modell_3d_url: string | null
huvudbild_id: string | null
bildgalleri_ordning: Json | null
```

#### Historical
```typescript
tidigare_forsaljningar: Json | null
renoveringshistorik: Json | null
skadehistorik: Json | null
```

#### Neighborhood
```typescript
naromradesbeskrivning: string | null
omradesstatistik: Json | null
prisutveckling_omrade: Json | null
```

#### Environmental
```typescript
miljocertifiering: string | null
svanenmarkt: boolean | null
```

#### Accessibility Details
```typescript
rullstolsanpassad: boolean | null
horslinga: boolean | null
```

## Implementation Notes

1. All fields should be added to all three interfaces: Row, Insert, and Update
2. In the Insert and Update interfaces, all fields should be optional (with ?)
3. The Json type is already defined at the top of the file
4. Remember to maintain consistent formatting and indentation
5. Group the fields with comments as shown above for better organization

## File Location
The file to update is: `/Users/ranishakir/Maklarsystem/maklarsystem/src/types/database.ts`

## Post-Update Tasks
After updating the TypeScript types:
1. Run TypeScript compiler to check for errors
2. Update any components that interact with the objekt table
3. Update form components to include new fields where appropriate