# Mäklarsystem - Field Analysis för Database Schema Extension

## Task 1.1: Analyze and Finalize Missing Fields and Data Types

### BEFINTLIGT SCHEMA ANALYS

**Nuvarande objekt-tabell har:**
- Grundläggande fält: typ, status, adress, postnummer, ort, kommun, län
- Pris: utgangspris, slutpris  
- Storlek: boarea, biarea, tomtarea, rum, byggaar
- Referenser: maklare_id, saljare_id, kopare_id
- Beskrivning: beskrivning (TEXT)

**Delvis implementerade fält i frontend (men saknas i DB):**
- driftkostnad, avgift, energiklass, byggmaterial, uppvarmning
- internet, kollektivtrafik, parkering, tillgangsdatum, visningsinfo

### DETALJERAD FÄLTANALYS

## 1. UTÖKAD FASTIGHETSINFORMATION
| Fält | Datatyp | Constraints | Enum Values | Kommentar |
|------|---------|-------------|-------------|-----------|
| balkong_terrass | BOOLEAN | NULL | - | Ja/Nej |
| hiss | BOOLEAN | NULL | - | Ja/Nej |
| vaning | INTEGER | CHECK (vaning >= -2 AND vaning <= 50) | - | Tillåter källare (-2,-1) |
| kok | VARCHAR(50) | NULL | ENUM | Se kok_typ nedan |
| badrum_antal | INTEGER | CHECK (badrum_antal >= 0 AND badrum_antal <= 10) | - | Antal badrum |
| garage | TEXT | NULL | - | Fritext för flexibilitet |
| forrad | BOOLEAN | NULL | - | Ja/Nej |
| tradgard | BOOLEAN | NULL | - | Ja/Nej |  
| pool | BOOLEAN | NULL | - | Ja/Nej |
| kamin | BOOLEAN | NULL | - | Ja/Nej |

**Föreslagna ENUM typer:**
```sql
CREATE TYPE kok_typ AS ENUM (
    'kokso', 'halvoppet', 'oppet', 'kokonk', 
    'modernt', 'renoverat', 'originalskick'
);
```

## 2. TEKNISK INFORMATION
| Fält | Datatyp | Constraints | Enum Values |
|------|---------|-------------|-------------|
| energiklass | VARCHAR(10) | NULL | ENUM |
| byggmaterial | VARCHAR(100) | NULL | ENUM |
| uppvarmning | VARCHAR(100) | NULL | ENUM |
| ventilation | VARCHAR(100) | NULL | ENUM |
| elnat | VARCHAR(100) | NULL | ENUM |
| isolering | VARCHAR(100) | NULL | ENUM |
| elforbrukning | DECIMAL(8,2) | NULL | - |
| vattenforbrukning | DECIMAL(8,2) | NULL | - |
| uppvarmningskostnad | DECIMAL(10,2) | NULL | - |

**Föreslagna ENUM typer:**
```sql
CREATE TYPE energiklass_typ AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G');

CREATE TYPE byggmaterial_typ AS ENUM (
    'tegel', 'trak', 'betong', 'puts', 'panel', 'natursten', 'annat'
);

CREATE TYPE uppvarmning_typ AS ENUM (
    'fjärrvärme', 'elvärme', 'pelletsbrännare', 'vedeldning', 
    'olja', 'gas', 'bergvärme', 'luftvärmepump', 'annat'
);

CREATE TYPE ventilation_typ AS ENUM (
    'mekanisk_til_och_franluft', 'mekanisk_franluft', 
    'naturlig', 'balanserad', 'frånluft'
);

CREATE TYPE elnat_typ AS ENUM (
    'trefas', 'enfas', 'trefas_16A', 'trefas_25A', 'trefas_35A'
);

CREATE TYPE isolering_typ AS ENUM (
    'mineralull', 'cellulosa', 'polyuretan', 'eps', 'xps', 'annat'
);
```

## 3. BYGGNAD OCH KONSTRUKTION
| Fält | Datatyp | Constraints | Enum Values |
|------|---------|-------------|-------------|
| bygglov | TEXT | NULL | - |
| senaste_renovering | DATE | NULL | - |
| taktyp | VARCHAR(50) | NULL | ENUM |
| fasadmaterial | VARCHAR(50) | NULL | ENUM |
| fonstertyp | VARCHAR(50) | NULL | ENUM |
| vatten_avlopp | TEXT | NULL | - |

**Föreslagna ENUM typer:**
```sql
CREATE TYPE taktyp_typ AS ENUM (
    'tegeltak', 'platt', 'betongpannor', 'sadeltak', 
    'mansardtak', 'pulpettak', 'annat'
);

CREATE TYPE fasadmaterial_typ AS ENUM (
    'tegel', 'puts', 'trak', 'panel', 'natursten', 
    'betong', 'eternit', 'annat'
);

CREATE TYPE fonstertyp_typ AS ENUM (
    'treglas', 'tvaglas', 'traglas_argon', 
    'aluminiumkarmar', 'trakarmar', 'plastkarmar'
);
```

## 4. SÄKERHET OCH SYSTEM
| Fält | Datatyp | Constraints | Enum Values |
|------|---------|-------------|-------------|
| brandskydd | TEXT | NULL | - |
| larm | TEXT | NULL | - |
| bredband | VARCHAR(100) | NULL | ENUM |
| kabel_tv | BOOLEAN | NULL | - |
| internet | TEXT | NULL | - |

**Föreslagna ENUM typer:**
```sql
CREATE TYPE bredband_typ AS ENUM (
    'fiber', 'adsl', 'kabel', 'mobilt', 'satellit', 'inte_tillgangligt'
);
```

## 5. LÄGE OCH OMGIVNING  
| Fält | Datatyp | Constraints | Enum Values |
|------|---------|-------------|-------------|
| narmaste_skola | TEXT | NULL | - |
| narmaste_vardcentral | TEXT | NULL | - |
| narmaste_dagis | TEXT | NULL | - |
| avstand_centrum | DECIMAL(5,2) | CHECK (avstand_centrum >= 0) | - |
| havsnara | BOOLEAN | NULL | - |
| sjonara | BOOLEAN | NULL | - |
| skogsnara | BOOLEAN | NULL | - |
| kollektivtrafik | TEXT | NULL | - |
| parkering | TEXT | NULL | - |

## 6. EKONOMI (UTÖKAD)
| Fält | Datatyp | Constraints | Enum Values |
|------|---------|-------------|-------------|
| driftkostnad | DECIMAL(10,2) | NULL | - |
| avgift | DECIMAL(10,2) | NULL | - |
| pantbrev | DECIMAL(12,2) | NULL | - |
| taxeringsvarde | DECIMAL(12,2) | NULL | - |
| kommunala_avgifter | DECIMAL(10,2) | NULL | - |
| forsakringskostnad | DECIMAL(10,2) | NULL | - |
| reparationsfond | DECIMAL(10,2) | NULL | - |

## 7. TILLGÄNGLIGHET
| Fält | Datatyp | Constraints | Enum Values |
|------|---------|-------------|-------------|
| tillgangsdatum | DATE | NULL | - |
| visningsinfo | TEXT | NULL | - |

## MIGRATION STRATEGI

### Phase 1: Core Infrastructure Fields
- Lägg till alla ENUM typer först
- Lägg till BOOLEAN fält (enkla)
- Lägg till NUMBER/INTEGER fält med constraints

### Phase 2: Text och Date fält
- Lägg till TEXT fält för fritext
- Lägg till DATE fält
- Lägg till DECIMAL fält för priser/kostnader

### Phase 3: Index och Performance
- Skapa index på vanliga sökfält
- Optimera för filterquery

## NAMING CONVENTIONS
- Använd snake_case för databasfält
- Prefixar inte fält (undvik obj_ etc)
- Kort men beskrivande namn
- Svensk namngivning för business-logik

## CONSTRAINTS MOTIVERING
- BOOLEAN för Ja/Nej fält - enklast och mest performant
- INTEGER med CHECK constraints för vettiga ranges
- DECIMAL för monetära värden - precision viktigt
- TEXT för fritext där längd varierar mycket
- VARCHAR(X) för kategoriska data med maxlängd

**RESULTAT: 35+ nya fält identifierade och analyserade från dashboard-bilden!** 