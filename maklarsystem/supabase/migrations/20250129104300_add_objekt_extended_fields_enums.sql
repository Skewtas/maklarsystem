-- Migration: Add ENUM types for extended objekt fields
-- Created: 2025-01-29 10:43:00
-- Description: Add all ENUM types needed for extended property information

-- 1. UTÖKAD FASTIGHETSINFORMATION ENUM
CREATE TYPE kok_typ AS ENUM (
    'kokso', 
    'halvoppet', 
    'oppet', 
    'kokonk', 
    'modernt', 
    'renoverat', 
    'originalskick'
);

-- 2. TEKNISK INFORMATION ENUMS
CREATE TYPE energiklass_typ AS ENUM (
    'A', 'B', 'C', 'D', 'E', 'F', 'G'
);

CREATE TYPE byggmaterial_typ AS ENUM (
    'tegel', 
    'trak', 
    'betong', 
    'puts', 
    'panel', 
    'natursten', 
    'annat'
);

CREATE TYPE uppvarmning_typ AS ENUM (
    'fjärrvärme', 
    'elvärme', 
    'pelletsbrännare', 
    'vedeldning', 
    'olja', 
    'gas', 
    'bergvärme', 
    'luftvärmepump', 
    'annat'
);

CREATE TYPE ventilation_typ AS ENUM (
    'mekanisk_til_och_franluft', 
    'mekanisk_franluft', 
    'naturlig', 
    'balanserad', 
    'frånluft'
);

CREATE TYPE elnat_typ AS ENUM (
    'trefas', 
    'enfas', 
    'trefas_16A', 
    'trefas_25A', 
    'trefas_35A'
);

CREATE TYPE isolering_typ AS ENUM (
    'mineralull', 
    'cellulosa', 
    'polyuretan', 
    'eps', 
    'xps', 
    'annat'
);

-- 3. BYGGNAD OCH KONSTRUKTION ENUMS
CREATE TYPE taktyp_typ AS ENUM (
    'tegeltak', 
    'platt', 
    'betongpannor', 
    'sadeltak', 
    'mansardtak', 
    'pulpettak', 
    'annat'
);

CREATE TYPE fasadmaterial_typ AS ENUM (
    'tegel', 
    'puts', 
    'trak', 
    'panel', 
    'natursten', 
    'betong', 
    'eternit', 
    'annat'
);

CREATE TYPE fonstertyp_typ AS ENUM (
    'treglas', 
    'tvaglas', 
    'traglas_argon', 
    'aluminiumkarmar', 
    'trakarmar', 
    'plastkarmar'
);

-- 4. SÄKERHET OCH SYSTEM ENUMS
CREATE TYPE bredband_typ AS ENUM (
    'fiber', 
    'adsl', 
    'kabel', 
    'mobilt', 
    'satellit', 
    'inte_tillgangligt'
);

-- Add comments to document the purpose of each enum
COMMENT ON TYPE kok_typ IS 'Kitchen types for property classification';
COMMENT ON TYPE energiklass_typ IS 'Energy efficiency classes A-G';
COMMENT ON TYPE byggmaterial_typ IS 'Primary building materials';
COMMENT ON TYPE uppvarmning_typ IS 'Heating system types';
COMMENT ON TYPE ventilation_typ IS 'Ventilation system types';
COMMENT ON TYPE elnat_typ IS 'Electrical system specifications';
COMMENT ON TYPE isolering_typ IS 'Insulation material types';
COMMENT ON TYPE taktyp_typ IS 'Roof construction types';
COMMENT ON TYPE fasadmaterial_typ IS 'Facade material types';
COMMENT ON TYPE fonstertyp_typ IS 'Window construction types';
COMMENT ON TYPE bredband_typ IS 'Broadband connection types'; 