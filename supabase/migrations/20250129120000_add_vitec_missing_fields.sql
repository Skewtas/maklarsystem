-- Add missing fields based on VITEC comparison
-- Migration: Add VITEC missing fields
-- Date: 2025-01-29

ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
-- Ownership and classification
agare_id UUID REFERENCES kontakter(id),
agare_typ TEXT CHECK (agare_typ IN ('privatperson', 'foretag', 'kommun', 'stat')) DEFAULT 'privatperson',
agandekategori TEXT CHECK (agandekategori IN ('agt', 'bostadsratt', 'hyresratt', 'arrende')) DEFAULT 'agt',

-- Enhanced pricing and bidding
accepterat_pris INTEGER,
budgivning BOOLEAN DEFAULT false,
budgivningsdatum DATE,
pristyp TEXT CHECK (pristyp IN ('fast', 'forhandling', 'budgivning')) DEFAULT 'fast',
prisutveckling TEXT,

-- Detailed monthly fees and costs
manadsavgift INTEGER,
avgift_innefattar TEXT, -- JSON array of what's included
kapitaltillskott INTEGER,
energikostnad_per_ar INTEGER,
drift_per_kvm INTEGER, -- calculated field

-- Enhanced room layout
antal_sovrum INTEGER,
antal_wc INTEGER,
antal_vaningar_hus INTEGER,
koksstorlek INTEGER, -- in m²
vardagsrumsstorlek INTEGER, -- in m²
kallare_area INTEGER, -- m²
garage_area INTEGER, -- m²

-- Energy certification
energiprestanda INTEGER, -- kWh/m²/år
energicertifikat_nummer TEXT,
energicertifikat_utfardad DATE,
energicertifikat_giltig_till DATE,

-- Enhanced amenities (more detailed than current boolean fields)
vinkallare BOOLEAN DEFAULT false,
hobbyrum BOOLEAN DEFAULT false,
carport BOOLEAN DEFAULT false,
bastu BOOLEAN DEFAULT false,
antal_parkeringsplatser INTEGER,

-- Enhanced descriptions
maklartext TEXT,
salutext TEXT,
visningsdagar TEXT,
oppet_hus TEXT,
specialbestammelser TEXT,
anmarkningar TEXT,

-- What's included/excluded
tillbehor_som_ingaar TEXT,
tillbehor_som_ej_ingaar TEXT,

-- Legal aspects
servitut TEXT,
inskrankning TEXT,
belastningar TEXT,
gemensamhetsanlaggning TEXT,
planerad_renovering TEXT,

-- Enhanced location data (coordinates for map)
latitude DECIMAL(10, 8),
longitude DECIMAL(11, 8),

-- Document references
planritning_url TEXT,
energideklaration_url TEXT,
byggnadsbeskrivning_url TEXT,

-- Marketing and availability
marknadsforingstext TEXT,
visningsdagar_detaljer TEXT,
oppet_hus_detaljer TEXT,

-- Timeline and status tracking
listningsdatum DATE,
avtal_datum DATE,
tilltraden_datum DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_objekt_agare_id ON objekt(agare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_budgivning ON objekt(budgivning);
CREATE INDEX IF NOT EXISTS idx_objekt_energiklass ON objekt(energiklass);
CREATE INDEX IF NOT EXISTS idx_objekt_manadsavgift ON objekt(manadsavgift);
CREATE INDEX IF NOT EXISTS idx_objekt_coordinates ON objekt(latitude, longitude);

-- Update existing objektnummer to be more structured if null
UPDATE objekt 
SET objektnummer = 'OBJ-' || EXTRACT(YEAR FROM created_at) || '-' || LPAD(EXTRACT(DOY FROM created_at)::TEXT, 3, '0') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 4, '0')
WHERE objektnummer IS NULL OR objektnummer = ''; 