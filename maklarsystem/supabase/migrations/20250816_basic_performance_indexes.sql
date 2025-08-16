-- ============================================
-- Migration: Basic Performance Indexes (No Function Dependencies)
-- Date: 2025-08-16
-- Description: Essential indexes without function dependencies
-- ============================================

-- 1. Simple composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_objekt_status_maklare ON objekt(status, maklare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_kommun_status ON objekt(kommun, status);
CREATE INDEX IF NOT EXISTS idx_objekt_ort_status ON objekt(ort, status);
CREATE INDEX IF NOT EXISTS idx_objekt_typ_status ON objekt(typ, status);
CREATE INDEX IF NOT EXISTS idx_objekt_created_at_desc ON objekt(created_at DESC);

-- 2. Enable text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Simple text search indexes (without concatenation)
CREATE INDEX IF NOT EXISTS idx_objekt_adress_trgm ON objekt USING gin (adress gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_objekt_beskrivning_trgm ON objekt USING gin (beskrivning gin_trgm_ops);
-- Skip the problematic name concatenation index
CREATE INDEX IF NOT EXISTS idx_kontakter_fornamn_trgm ON kontakter USING gin (fornamn gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kontakter_efternamn_trgm ON kontakter USING gin (efternamn gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kontakter_foretag_trgm ON kontakter USING gin (foretag gin_trgm_ops);

-- 4. Partial indexes for common filters
CREATE INDEX IF NOT EXISTS idx_objekt_active ON objekt(id) WHERE status IN ('till_salu', 'uppdrag');
CREATE INDEX IF NOT EXISTS idx_objekt_sold ON objekt(id, slutpris) WHERE status = 'sald';
CREATE INDEX IF NOT EXISTS idx_bud_active ON bud(objekt_id, belopp) WHERE status = 'aktivt';
CREATE INDEX IF NOT EXISTS idx_uppgifter_pending ON uppgifter(tilldelad_till, deadline) WHERE status IN ('ny', 'pagaende');

-- 5. Simple date indexes (without CURRENT_DATE in WHERE clause)
CREATE INDEX IF NOT EXISTS idx_visningar_datum ON visningar(datum, starttid);
CREATE INDEX IF NOT EXISTS idx_kalenderhändelser_starttid ON kalenderhändelser(starttid);
CREATE INDEX IF NOT EXISTS idx_notifikationer_unread ON notifikationer(user_id, created_at) WHERE last = false;

-- 6. Foreign key covering indexes
CREATE INDEX IF NOT EXISTS idx_objekt_maklare ON objekt(maklare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_saljare ON objekt(saljare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_kopare ON objekt(kopare_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_objekt ON uppgifter(objekt_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_kontakt ON uppgifter(kontakt_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_tilldelad ON uppgifter(tilldelad_till);

-- 7. Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_bud_objekt ON bud(objekt_id);
CREATE INDEX IF NOT EXISTS idx_visningar_objekt ON visningar(objekt_id);
CREATE INDEX IF NOT EXISTS idx_kontakter_email ON kontakter(email);
CREATE INDEX IF NOT EXISTS idx_kontakter_telefon ON kontakter(telefon);

-- 8. Check if property_images exists before creating its index
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'property_images') THEN
        CREATE INDEX IF NOT EXISTS idx_property_images_objekt ON property_images(objekt_id);
        CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(objekt_id) WHERE is_primary = true;
        CREATE INDEX IF NOT EXISTS idx_property_images_order ON property_images(objekt_id, display_order);
    END IF;
END $$;

-- 9. Analyze tables to update statistics
ANALYZE objekt;
ANALYZE kontakter;
ANALYZE visningar;
ANALYZE bud;
ANALYZE uppgifter;
ANALYZE kalenderhändelser;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Basic performance indexes created successfully!';
END $$;