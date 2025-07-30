-- Migration: Add indexes for extended objekt fields
-- Created: 2025-01-29 10:43:02
-- Description: Add indexes for better query performance on searchable fields

-- Indexes for filtering and searching commonly used fields
CREATE INDEX IF NOT EXISTS idx_objekt_energiklass ON objekt(energiklass);
CREATE INDEX IF NOT EXISTS idx_objekt_byggmaterial ON objekt(byggmaterial);
CREATE INDEX IF NOT EXISTS idx_objekt_uppvarmning ON objekt(uppvarmning);
CREATE INDEX IF NOT EXISTS idx_objekt_vaning ON objekt(vaning);
CREATE INDEX IF NOT EXISTS idx_objekt_badrum_antal ON objekt(badrum_antal);

-- Boolean indexes for yes/no filters
CREATE INDEX IF NOT EXISTS idx_objekt_balkong_terrass ON objekt(balkong_terrass) WHERE balkong_terrass = true;
CREATE INDEX IF NOT EXISTS idx_objekt_hiss ON objekt(hiss) WHERE hiss = true;
CREATE INDEX IF NOT EXISTS idx_objekt_pool ON objekt(pool) WHERE pool = true;
CREATE INDEX IF NOT EXISTS idx_objekt_kamin ON objekt(kamin) WHERE kamin = true;
CREATE INDEX IF NOT EXISTS idx_objekt_havsnara ON objekt(havsnara) WHERE havsnara = true;
CREATE INDEX IF NOT EXISTS idx_objekt_sjonara ON objekt(sjonara) WHERE sjonara = true;
CREATE INDEX IF NOT EXISTS idx_objekt_skogsnara ON objekt(skogsnara) WHERE skogsnara = true;

-- Price range indexes for filtering
CREATE INDEX IF NOT EXISTS idx_objekt_driftkostnad ON objekt(driftkostnad);
CREATE INDEX IF NOT EXISTS idx_objekt_avgift ON objekt(avgift);
CREATE INDEX IF NOT EXISTS idx_objekt_taxeringsvarde ON objekt(taxeringsvarde);

-- Location and distance indexes
CREATE INDEX IF NOT EXISTS idx_objekt_avstand_centrum ON objekt(avstand_centrum);

-- Date indexes
CREATE INDEX IF NOT EXISTS idx_objekt_senaste_renovering ON objekt(senaste_renovering);
CREATE INDEX IF NOT EXISTS idx_objekt_tillgangsdatum ON objekt(tillgangsdatum);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_objekt_energiklass_uppvarmning ON objekt(energiklass, uppvarmning);
CREATE INDEX IF NOT EXISTS idx_objekt_vaning_hiss ON objekt(vaning, hiss);
CREATE INDEX IF NOT EXISTS idx_objekt_location_features ON objekt(havsnara, sjonara, skogsnara) WHERE havsnara = true OR sjonara = true OR skogsnara = true;

-- Full-text search indexes for text fields (using GIN indexes)
CREATE INDEX IF NOT EXISTS idx_objekt_garage_fulltext ON objekt USING GIN (to_tsvector('swedish', garage)) WHERE garage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_objekt_bygglov_fulltext ON objekt USING GIN (to_tsvector('swedish', bygglov)) WHERE bygglov IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_objekt_parkering_fulltext ON objekt USING GIN (to_tsvector('swedish', parkering)) WHERE parkering IS NOT NULL; 