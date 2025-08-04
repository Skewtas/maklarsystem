# Objekt Table Missing Fields Analysis

## Current State
Based on analysis of `database.ts` and the existing migration `20250129120000_add_vitec_missing_fields.sql`, the following fields appear to be missing from the TypeScript types but exist in the migration:

### Fields in Migration but NOT in TypeScript Types:
None - the TypeScript types appear to be comprehensive and include all the fields from the migration.

## Additional Fields Commonly Found in Swedish Real Estate Systems

After analyzing typical Swedish real estate management systems (Vitec, Mspecs, etc.), here are fields that could be considered for addition:

### 1. Enhanced Property Classification
- `undertyp`: More specific sub-types (e.g., 'parhus', 'kedjehus', 'enplansvilla')
- `fastighetstyp`: Property type classification ('småhusenhet', 'hyreshusenhet', 'lantbruksenhet')
- `fastighetsbeteckning`: Official property designation

### 2. Additional Financial Information
- `boendekalkyl_url`: Link to living cost calculation
- `lagfartskostnad`: Title deed cost
- `stämpelskatt`: Stamp duty
- `överlåtelseavgift`: Transfer fee
- `andel_i_förening`: Share percentage in housing cooperative
- `skulder_förening`: Housing cooperative debts
- `ekonomisk_plan_url`: Link to financial plan

### 3. Technical Specifications
- `grundläggning`: Foundation type ('platta', 'källare', 'krypgrund')
- `bjälklag`: Floor structure type
- `stomme`: Frame structure material
- `planlösning_typ`: Layout type ('öppen', 'traditionell', 'genomgående')
- `takhöjd`: Ceiling height
- `standard_nivå`: Standard level ('hög', 'normal', 'renovering_behövs')

### 4. Utilities and Services
- `sophämtning`: Waste collection details
- `snöröjning`: Snow removal arrangements
- `el_abonnemang`: Electricity subscription type
- `försäkringsbolag`: Insurance company
- `hemförsäkring_ingår`: Home insurance included (boolean)

### 5. Additional Legal and Administrative
- `andelstal`: Share ratio
- `pantsatt`: Pledged (boolean)
- `inteckningar`: Mortgages details
- `förköpsrätt`: Pre-emption right
- `hembudsklausul`: Right of first refusal clause
- `andrahandsuthyrning_tillåten`: Subletting allowed (boolean)

### 6. Marketing and Media
- `virtuell_visning_url`: Virtual tour URL
- `drönarvideo_url`: Drone video URL
- `3d_modell_url`: 3D model URL
- `huvudbild_id`: Main image identifier
- `bildgalleri_ordning`: Image gallery order (JSON)

### 7. Historical Data
- `tidigare_försäljningar`: Previous sales (JSON array)
- `renoveringshistorik`: Renovation history (JSON array)
- `skadehistorik`: Damage history (JSON array)

### 8. Neighborhood Information
- `närområdesbeskrivning`: Neighborhood description
- `områdesstatistik`: Area statistics (JSON)
- `prisutveckling_område`: Area price development

### 9. Environmental Certifications
- `miljöcertifiering`: Environmental certification type
- `svanenmärkt`: Swan ecolabel (boolean)
- `solceller`: Solar panels (boolean)
- `laddbox`: EV charging box (boolean)

### 10. Accessibility
- `tillgänglighetsanpassad`: Accessibility adapted (boolean)
- `rullstolsanpassad`: Wheelchair accessible (boolean)
- `hörslinga`: Hearing loop (boolean)

## Recommendation

The current schema is already quite comprehensive. The migration file from 2025-01-29 has added most essential fields. However, based on modern Swedish real estate practices, we could consider adding:

### Priority 1 (Essential):
- `fastighetsbeteckning`
- `undertyp`
- `andel_i_förening`
- `andelstal`
- `virtuell_visning_url`

### Priority 2 (Valuable):
- `boendekalkyl_url`
- `standard_nivå`
- `tillgänglighetsanpassad`
- `laddbox`
- `solceller`

### Priority 3 (Nice to have):
- Environmental certifications
- Historical data fields
- Extended neighborhood information

## Next Steps

1. Confirm which additional fields are actually needed for the business requirements
2. Create SQL migration for the selected fields
3. Update TypeScript types in database.ts
4. Test migrations in staging environment