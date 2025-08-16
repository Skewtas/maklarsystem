-- ============================================
-- Migration: Performance Optimization Indexes
-- Date: 2025-08-16
-- Description: Additional indexes for query performance
-- ============================================

-- 1. Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_objekt_status_maklare ON objekt(status, maklare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_kommun_status ON objekt(kommun, status);
CREATE INDEX IF NOT EXISTS idx_objekt_ort_status ON objekt(ort, status);
CREATE INDEX IF NOT EXISTS idx_objekt_typ_status ON objekt(typ, status);
CREATE INDEX IF NOT EXISTS idx_objekt_created_at_desc ON objekt(created_at DESC);

-- 2. Text search indexes for Swedish content
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_objekt_adress_trgm ON objekt USING gin (adress gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_objekt_beskrivning_trgm ON objekt USING gin (beskrivning gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kontakter_namn_trgm ON kontakter USING gin ((fornamn || ' ' || efternamn) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kontakter_foretag_trgm ON kontakter USING gin (foretag gin_trgm_ops);

-- 3. Partial indexes for common filters
CREATE INDEX IF NOT EXISTS idx_objekt_active ON objekt(id) WHERE status IN ('till_salu', 'uppdrag');
CREATE INDEX IF NOT EXISTS idx_objekt_sold ON objekt(id, slutpris) WHERE status = 'sald';
CREATE INDEX IF NOT EXISTS idx_bud_active ON bud(objekt_id, belopp) WHERE status = 'aktivt';
CREATE INDEX IF NOT EXISTS idx_uppgifter_pending ON uppgifter(tilldelad_till, deadline) WHERE status IN ('ny', 'pagaende');

-- 4. Indexes for date-based queries
CREATE INDEX IF NOT EXISTS idx_visningar_future ON visningar(datum, starttid) WHERE datum >= CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_kalenderhändelser_upcoming ON kalenderhändelser(starttid) WHERE starttid >= NOW();
CREATE INDEX IF NOT EXISTS idx_notifikationer_unread ON notifikationer(user_id, created_at) WHERE last = false;

-- 5. Foreign key covering indexes
CREATE INDEX IF NOT EXISTS idx_objekt_relations ON objekt(maklare_id, saljare_id, kopare_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_relations ON uppgifter(objekt_id, kontakt_id, tilldelad_till, skapad_av);

-- 6. BRIN indexes for large tables with sequential data
CREATE INDEX IF NOT EXISTS idx_property_images_created_brin ON property_images USING brin (created_at);
CREATE INDEX IF NOT EXISTS idx_notifikationer_created_brin ON notifikationer USING brin (created_at);

-- 7. Analyze tables to update statistics
ANALYZE objekt;
ANALYZE kontakter;
ANALYZE visningar;
ANALYZE bud;
ANALYZE uppgifter;
ANALYZE kalenderhändelser;
ANALYZE notifikationer;
ANALYZE property_images;
ANALYZE users;