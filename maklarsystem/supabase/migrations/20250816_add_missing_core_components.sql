-- ============================================
-- Migration: Add Missing Core Components
-- Date: 2025-08-16
-- Description: Adds critical missing components for Swedish real estate system
-- ============================================

-- 1. Add missing triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_objekt_updated_at BEFORE UPDATE ON objekt
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kontakter_updated_at BEFORE UPDATE ON kontakter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visningar_updated_at BEFORE UPDATE ON visningar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bud_updated_at BEFORE UPDATE ON bud
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uppgifter_updated_at BEFORE UPDATE ON uppgifter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kalenderhändelser_updated_at BEFORE UPDATE ON kalenderhändelser
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_images_updated_at BEFORE UPDATE ON property_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Add missing fields to objekt table for Swedish real estate
ALTER TABLE objekt 
ADD COLUMN IF NOT EXISTS fastighetsbeteckning VARCHAR(255),
ADD COLUMN IF NOT EXISTS lagfart_datum DATE,
ADD COLUMN IF NOT EXISTS pantbrev_belopp NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS driftskostnad NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS avgift_manad NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS energiklass VARCHAR(10),
ADD COLUMN IF NOT EXISTS vaningsplan INTEGER,
ADD COLUMN IF NOT EXISTS antal_plan INTEGER,
ADD COLUMN IF NOT EXISTS hiss BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS balkong BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS renovering_ar INTEGER,
ADD COLUMN IF NOT EXISTS varme_typ VARCHAR(50),
ADD COLUMN IF NOT EXISTS vatten_avlopp VARCHAR(50),
ADD COLUMN IF NOT EXISTS internet_typ VARCHAR(50),
ADD COLUMN IF NOT EXISTS garage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parkering_typ VARCHAR(50),
ADD COLUMN IF NOT EXISTS forrad BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tilltraden_datum DATE,
ADD COLUMN IF NOT EXISTS visning_information TEXT,
ADD COLUMN IF NOT EXISTS provision_text TEXT,
ADD COLUMN IF NOT EXISTS sarskilda_villkor TEXT,
ADD COLUMN IF NOT EXISTS uppdragsavtal_datum DATE,
ADD COLUMN IF NOT EXISTS uppdragsavtal_typ VARCHAR(50),
ADD COLUMN IF NOT EXISTS marknadsforingsplan TEXT,
ADD COLUMN IF NOT EXISTS ovrigt TEXT;

-- 3. Add missing fields to kontakter for Swedish requirements
ALTER TABLE kontakter 
ADD COLUMN IF NOT EXISTS kalla VARCHAR(100), -- Lead source
ADD COLUMN IF NOT EXISTS intresse_grad INTEGER CHECK (intresse_grad >= 1 AND intresse_grad <= 5),
ADD COLUMN IF NOT EXISTS budget_min NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS budget_max NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS onskemal TEXT,
ADD COLUMN IF NOT EXISTS finansiering_klar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS laneloften_belopp NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS anteckningar TEXT,
ADD COLUMN IF NOT EXISTS senaste_kontakt DATE,
ADD COLUMN IF NOT EXISTS nasta_kontakt DATE,
ADD COLUMN IF NOT EXISTS gdpr_samtycke BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gdpr_samtycke_datum TIMESTAMP WITH TIME ZONE;

-- 4. Add missing fields to visningar
ALTER TABLE visningar
ADD COLUMN IF NOT EXISTS anteckningar TEXT,
ADD COLUMN IF NOT EXISTS vaderlek VARCHAR(50),
ADD COLUMN IF NOT EXISTS ansvarig_maklare UUID REFERENCES users(id);

-- 5. Add missing fields to bud
ALTER TABLE bud
ADD COLUMN IF NOT EXISTS villkor TEXT,
ADD COLUMN IF NOT EXISTS finansiering_bekraftad BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS giltig_till DATE,
ADD COLUMN IF NOT EXISTS kommentar TEXT;

-- 6. Create dokument table for document management
CREATE TABLE IF NOT EXISTS dokument (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objekt_id UUID REFERENCES objekt(id) ON DELETE CASCADE,
    kontakt_id UUID REFERENCES kontakter(id) ON DELETE CASCADE,
    typ VARCHAR(50) NOT NULL,
    namn VARCHAR(255) NOT NULL,
    beskrivning TEXT,
    fil_url TEXT NOT NULL,
    storlek_bytes BIGINT,
    uppladdad_av UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create budgivning_historik for bid history tracking
CREATE TABLE IF NOT EXISTS budgivning_historik (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bud_id UUID REFERENCES bud(id) ON DELETE CASCADE,
    objekt_id UUID REFERENCES objekt(id) ON DELETE CASCADE,
    spekulant_id UUID REFERENCES kontakter(id),
    belopp NUMERIC(12,2) NOT NULL,
    status VARCHAR(50),
    handelse VARCHAR(100),
    kommentar TEXT,
    registrerad_av UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create intresseanmalan table for interest registrations
CREATE TABLE IF NOT EXISTS intresseanmalan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objekt_id UUID REFERENCES objekt(id) ON DELETE CASCADE,
    kontakt_id UUID REFERENCES kontakter(id) ON DELETE CASCADE,
    datum DATE DEFAULT CURRENT_DATE,
    kanal VARCHAR(50), -- website, email, phone, visit
    meddelande TEXT,
    status VARCHAR(50) DEFAULT 'ny',
    uppfoljd BOOLEAN DEFAULT false,
    uppfoljd_datum DATE,
    uppfoljd_av UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create marknadsstatistik table for market statistics
CREATE TABLE IF NOT EXISTS marknadsstatistik (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objekt_typ objekt_typ,
    kommun VARCHAR(255),
    lan VARCHAR(255),
    period_start DATE,
    period_slut DATE,
    genomsnittspris NUMERIC(12,2),
    medianpris NUMERIC(12,2),
    antal_salda INTEGER,
    genomsnitt_dagar_till_forsaljning INTEGER,
    prisutveckling_procent NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Add indexes for new tables and fields
CREATE INDEX idx_dokument_objekt ON dokument(objekt_id);
CREATE INDEX idx_dokument_kontakt ON dokument(kontakt_id);
CREATE INDEX idx_budgivning_historik_objekt ON budgivning_historik(objekt_id);
CREATE INDEX idx_budgivning_historik_bud ON budgivning_historik(bud_id);
CREATE INDEX idx_intresseanmalan_objekt ON intresseanmalan(objekt_id);
CREATE INDEX idx_intresseanmalan_kontakt ON intresseanmalan(kontakt_id);
CREATE INDEX idx_intresseanmalan_status ON intresseanmalan(status);
CREATE INDEX idx_marknadsstatistik_period ON marknadsstatistik(period_start, period_slut);
CREATE INDEX idx_objekt_fastighetsbeteckning ON objekt(fastighetsbeteckning);
CREATE INDEX idx_objekt_energiklass ON objekt(energiklass);
CREATE INDEX idx_kontakter_intresse_grad ON kontakter(intresse_grad);
CREATE INDEX idx_kontakter_kalla ON kontakter(kalla);

-- 11. Add RLS policies for new tables
ALTER TABLE dokument ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgivning_historik ENABLE ROW LEVEL SECURITY;
ALTER TABLE intresseanmalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE marknadsstatistik ENABLE ROW LEVEL SECURITY;

-- Dokument policies
CREATE POLICY "dok_select" ON dokument FOR SELECT 
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare', 'koordinator')
    ));

CREATE POLICY "dok_insert" ON dokument FOR INSERT 
    WITH CHECK (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    ));

CREATE POLICY "dok_update" ON dokument FOR UPDATE 
    USING (uppladdad_av = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "dok_delete" ON dokument FOR DELETE 
    USING (uppladdad_av = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Budgivning historik policies
CREATE POLICY "bud_hist_select" ON budgivning_historik FOR SELECT 
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare', 'koordinator')
    ));

CREATE POLICY "bud_hist_insert" ON budgivning_historik FOR INSERT 
    WITH CHECK (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    ));

-- Intresseanmalan policies
CREATE POLICY "intresse_select" ON intresseanmalan FOR SELECT 
    USING (auth.uid() IN (
        SELECT id FROM users
    ));

CREATE POLICY "intresse_insert" ON intresseanmalan FOR INSERT 
    WITH CHECK (true); -- Allow public interest registrations

CREATE POLICY "intresse_update" ON intresseanmalan FOR UPDATE 
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    ));

-- Marknadsstatistik policies (read-only for most users)
CREATE POLICY "stats_select" ON marknadsstatistik FOR SELECT 
    USING (true); -- Public read access

CREATE POLICY "stats_insert" ON marknadsstatistik FOR INSERT 
    WITH CHECK (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    ));

CREATE POLICY "stats_update" ON marknadsstatistik FOR UPDATE 
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    ));

-- 12. Add missing sequences
CREATE SEQUENCE IF NOT EXISTS dokument_nummer_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS intresse_nummer_seq START 1;

-- 13. Add triggers for new tables
CREATE TRIGGER update_dokument_updated_at BEFORE UPDATE ON dokument
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intresseanmalan_updated_at BEFORE UPDATE ON intresseanmalan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marknadsstatistik_updated_at BEFORE UPDATE ON marknadsstatistik
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();