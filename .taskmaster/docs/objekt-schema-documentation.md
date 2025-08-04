# Objekt Table Schema Documentation

## Table Overview
The `objekt` table is the central table for storing property/real estate listings in the Mäklarsystem. It contains comprehensive information about properties including basic details, technical specifications, financial information, and marketing data.

## Schema Structure

### Basic Information
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PRIMARY KEY |
| objektnummer | TEXT | Property reference number | UNIQUE |
| typ | ENUM | Property type | villa, lagenhet, radhus, fritidshus, tomt |
| status | ENUM | Current status | kundbearbetning, uppdrag, till_salu, sald, tilltraden |
| adress | TEXT | Street address | NOT NULL |
| postnummer | TEXT | Postal code | NOT NULL |
| ort | TEXT | City/locality | NOT NULL |
| kommun | TEXT | Municipality | NOT NULL |
| lan | TEXT | County/region | NOT NULL |

### Pricing Information
| Column | Type | Description |
|--------|------|-------------|
| utgangspris | INTEGER | Asking price |
| slutpris | INTEGER | Final sale price |
| accepterat_pris | INTEGER | Accepted price |
| budgivning | BOOLEAN | Bidding active |
| budgivningsdatum | DATE | Bidding date |
| pristyp | ENUM | Price type (fast, forhandling, budgivning) |
| prisutveckling | TEXT | Price development history |

### Property Measurements
| Column | Type | Description |
|--------|------|-------------|
| boarea | INTEGER | Living area (m²) |
| biarea | INTEGER | Secondary area (m²) |
| tomtarea | INTEGER | Plot area (m²) |
| rum | INTEGER | Number of rooms |
| byggaar | INTEGER | Year built |

### NEW: Property Classification (Priority 1)
| Column | Type | Description |
|--------|------|-------------|
| fastighetsbeteckning | TEXT | Official property designation |
| undertyp | ENUM | Detailed sub-type (parhus, kedjehus, etc.) |

### NEW: Cooperative Details (Priority 1)
| Column | Type | Description |
|--------|------|-------------|
| andel_i_forening | DECIMAL(5,2) | Share % in cooperative |
| andelstal | DECIMAL(10,6) | Share ratio |

### Room Layout Details
| Column | Type | Description |
|--------|------|-------------|
| antal_sovrum | INTEGER | Number of bedrooms |
| antal_wc | INTEGER | Number of WCs |
| antal_vaningar_hus | INTEGER | Number of floors |
| koksstorlek | INTEGER | Kitchen size (m²) |
| vardagsrumsstorlek | INTEGER | Living room size (m²) |
| kallare_area | INTEGER | Basement area (m²) |
| garage_area | INTEGER | Garage area (m²) |

### Energy & Environment
| Column | Type | Description |
|--------|------|-------------|
| energiklass | ENUM | Energy rating (A-G) |
| energiprestanda | INTEGER | Energy performance (kWh/m²/år) |
| energicertifikat_nummer | TEXT | Energy certificate number |
| energicertifikat_utfardad | DATE | Certificate issue date |
| energicertifikat_giltig_till | DATE | Certificate expiry date |

### NEW: Modern Amenities (Priority 2)
| Column | Type | Description |
|--------|------|-------------|
| laddbox | BOOLEAN | EV charging box installed |
| laddbox_typ | ENUM | Charger type (1-fas, 3-fas, etc.) |
| laddbox_antal | INTEGER | Number of charging points |
| solceller | BOOLEAN | Solar panels installed |
| solceller_kapacitet_kwp | DECIMAL(5,2) | Solar capacity (kWp) |

### Technical Systems
| Column | Type | Description |
|--------|------|-------------|
| uppvarmning | ENUM | Heating type |
| ventilation | ENUM | Ventilation type |
| elnat | ENUM | Electrical system |
| bredband | ENUM | Broadband type |
| vatten_avlopp | TEXT | Water/sewage details |

### Building Construction
| Column | Type | Description |
|--------|------|-------------|
| byggmaterial | ENUM | Building material |
| taktyp | ENUM | Roof type |
| fasadmaterial | ENUM | Facade material |
| fonstertyp | ENUM | Window type |
| NEW: grundlaggning | ENUM | Foundation type |
| NEW: planlosning_typ | ENUM | Layout type |

### Financial Information
| Column | Type | Description |
|--------|------|-------------|
| manadsavgift | INTEGER | Monthly fee |
| avgift | INTEGER | Association fee |
| driftkostnad | INTEGER | Operating cost |
| taxeringsvarde | INTEGER | Tax assessment value |
| pantbrev | INTEGER | Mortgage deeds |
| NEW: lagfartskostnad | INTEGER | Title deed cost |
| NEW: stampelskatt | INTEGER | Stamp duty |

### Marketing & Media
| Column | Type | Description |
|--------|------|-------------|
| beskrivning | TEXT | General description |
| maklartext | TEXT | Agent's description |
| marknadsforingstext | TEXT | Marketing text |
| NEW: virtuell_visning_url | TEXT | Virtual tour URL |
| NEW: dronarvideo_url | TEXT | Drone video URL |
| NEW: modell_3d_url | TEXT | 3D model URL |

### NEW: Quality & Accessibility (Priority 2)
| Column | Type | Description |
|--------|------|-------------|
| standard_niva | ENUM | Standard level (hög, normal, etc.) |
| tillganglighetsanpassad | BOOLEAN | Accessibility adapted |
| rullstolsanpassad | BOOLEAN | Wheelchair accessible |
| horslinga | BOOLEAN | Hearing loop installed |

### Relationships
| Column | Type | Description | References |
|--------|------|-------------|------------|
| maklare_id | UUID | Assigned agent | users.id |
| saljare_id | UUID | Seller | kontakter.id |
| kopare_id | UUID | Buyer | kontakter.id |
| agare_id | UUID | Current owner | kontakter.id |

### Timestamps
| Column | Type | Description |
|--------|------|-------------|
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |
| listningsdatum | DATE | Listing date |
| avtal_datum | DATE | Contract date |
| tilltraden_datum | DATE | Closing date |

## Indexes

### Existing Indexes
- PRIMARY KEY (id)
- UNIQUE (objektnummer)
- idx_objekt_status
- idx_objekt_typ
- idx_objekt_kommun
- idx_objekt_maklare_id

### New Indexes (Priority 1 & 2)
- idx_objekt_fastighetsbeteckning
- idx_objekt_undertyp
- idx_objekt_standard_niva
- idx_objekt_tillganglighetsanpassad
- idx_objekt_laddbox
- idx_objekt_solceller

## Enumerations

### Property Types (typ)
- `villa` - House/Villa
- `lagenhet` - Apartment
- `radhus` - Townhouse
- `fritidshus` - Vacation home
- `tomt` - Land/Plot

### Property Subtypes (undertyp) - NEW
- `parhus` - Semi-detached
- `kedjehus` - Terraced house
- `radhus_mellan` - Middle townhouse
- `radhus_gavelbostad` - End townhouse
- `enplansvilla` - Single-story house
- `tvåplansvilla` - Two-story house
- `souterrangvilla` - Split-level house
- And more...

### Standard Levels (standard_niva) - NEW
- `hög` - High
- `mycket_hög` - Very high
- `normal` - Normal
- `låg` - Low
- `renovering_behövs` - Renovation needed
- `totalrenovering_krävs` - Total renovation required

## Usage Examples

### Finding properties with modern amenities
```sql
SELECT * FROM objekt 
WHERE laddbox = true 
AND solceller = true 
AND standard_niva = 'hög';
```

### Properties by official designation
```sql
SELECT * FROM objekt 
WHERE fastighetsbeteckning LIKE 'STOCKHOLM%';
```

### Accessible properties
```sql
SELECT * FROM objekt 
WHERE tillganglighetsanpassad = true 
OR rullstolsanpassad = true;
```

## Notes
- All fields are nullable unless specified
- Prices are stored in SEK as integers
- Areas are stored in square meters
- Dates use ISO 8601 format
- JSONB fields are used for flexible data structures