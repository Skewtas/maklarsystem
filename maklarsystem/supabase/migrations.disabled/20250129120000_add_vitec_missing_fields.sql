-- Add missing fields based on VITEC comparison
-- Migration: Add VITEC missing fields
-- Date: 2025-01-29

ALTER TABLE public.objekt 
  ADD COLUMN IF NOT EXISTS agare_id UUID REFERENCES public.kontakter(id),
  ADD COLUMN IF NOT EXISTS agare_typ TEXT CHECK (agare_typ IN ('privatperson', 'foretag', 'kommun', 'stat')) DEFAULT 'privatperson',
  ADD COLUMN IF NOT EXISTS agandekategori TEXT CHECK (agandekategori IN ('agt', 'bostadsratt', 'hyresratt', 'arrende')) DEFAULT 'agt',

  ADD COLUMN IF NOT EXISTS accepterat_pris INTEGER,
  ADD COLUMN IF NOT EXISTS budgivning BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS budgivningsdatum DATE,
  ADD COLUMN IF NOT EXISTS pristyp TEXT CHECK (pristyp IN ('fast', 'forhandling', 'budgivning')) DEFAULT 'fast',
  ADD COLUMN IF NOT EXISTS prisutveckling TEXT,

  ADD COLUMN IF NOT EXISTS manadsavgift INTEGER,
  ADD COLUMN IF NOT EXISTS avgift_innefattar TEXT,
  ADD COLUMN IF NOT EXISTS kapitaltillskott INTEGER,
  ADD COLUMN IF NOT EXISTS energikostnad_per_ar INTEGER,
  ADD COLUMN IF NOT EXISTS drift_per_kvm INTEGER,

  ADD COLUMN IF NOT EXISTS antal_sovrum INTEGER,
  ADD COLUMN IF NOT EXISTS antal_wc INTEGER,
  ADD COLUMN IF NOT EXISTS antal_vaningar_hus INTEGER,
  ADD COLUMN IF NOT EXISTS koksstorlek INTEGER,
  ADD COLUMN IF NOT EXISTS vardagsrumsstorlek INTEGER,
  ADD COLUMN IF NOT EXISTS kallare_area INTEGER,
  ADD COLUMN IF NOT EXISTS garage_area INTEGER,

  ADD COLUMN IF NOT EXISTS energiprestanda INTEGER,
  ADD COLUMN IF NOT EXISTS energicertifikat_nummer TEXT,
  ADD COLUMN IF NOT EXISTS energicertifikat_utfardad DATE,
  ADD COLUMN IF NOT EXISTS energicertifikat_giltig_till DATE,

  ADD COLUMN IF NOT EXISTS vinkallare BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hobbyrum BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS carport BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bastu BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS antal_parkeringsplatser INTEGER,

  ADD COLUMN IF NOT EXISTS maklartext TEXT,
  ADD COLUMN IF NOT EXISTS salutext TEXT,
  ADD COLUMN IF NOT EXISTS visningsdagar TEXT,
  ADD COLUMN IF NOT EXISTS oppet_hus TEXT,
  ADD COLUMN IF NOT EXISTS specialbestammelser TEXT,
  ADD COLUMN IF NOT EXISTS anmarkningar TEXT,

  ADD COLUMN IF NOT EXISTS tillbehor_som_ingaar TEXT,
  ADD COLUMN IF NOT EXISTS tillbehor_som_ej_ingaar TEXT,

  ADD COLUMN IF NOT EXISTS servitut TEXT,
  ADD COLUMN IF NOT EXISTS inskrankning TEXT,
  ADD COLUMN IF NOT EXISTS belastningar TEXT,
  ADD COLUMN IF NOT EXISTS gemensamhetsanlaggning TEXT,
  ADD COLUMN IF NOT EXISTS planerad_renovering TEXT,

  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),

  ADD COLUMN IF NOT EXISTS planritning_url TEXT,
  ADD COLUMN IF NOT EXISTS energideklaration_url TEXT,
  ADD COLUMN IF NOT EXISTS byggnadsbeskrivning_url TEXT,

  ADD COLUMN IF NOT EXISTS marknadsforingstext TEXT,
  ADD COLUMN IF NOT EXISTS visningsdagar_detaljer TEXT,
  ADD COLUMN IF NOT EXISTS oppet_hus_detaljer TEXT,

  ADD COLUMN IF NOT EXISTS listningsdatum DATE,
  ADD COLUMN IF NOT EXISTS avtal_datum DATE,
  ADD COLUMN IF NOT EXISTS tilltraden_datum DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_objekt_agare_id ON public.objekt(agare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_budgivning ON public.objekt(budgivning);
CREATE INDEX IF NOT EXISTS idx_objekt_energiklass ON public.objekt(energiklass);
CREATE INDEX IF NOT EXISTS idx_objekt_manadsavgift ON public.objekt(manadsavgift);
CREATE INDEX IF NOT EXISTS idx_objekt_coordinates ON public.objekt(latitude, longitude);

-- Update existing objektnummer to be more structured if null
DO $$
DECLARE
  r RECORD;
  counter INTEGER := 0;
  ye TEXT;
  doy TEXT;
BEGIN
  FOR r IN SELECT id, created_at FROM public.objekt WHERE objektnummer IS NULL OR objektnummer = '' ORDER BY created_at LOOP
    counter := counter + 1;
    ye := to_char(r.created_at, 'YYYY');
    doy := to_char(r.created_at, 'DDD');
    UPDATE public.objekt
    SET objektnummer = 'OBJ-' || ye || '-' || doy || '-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = r.id;
  END LOOP;
END $$;