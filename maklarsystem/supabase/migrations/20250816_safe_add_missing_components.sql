-- ============================================
-- Migration: Safely Add Missing Core Components
-- Date: 2025-08-16
-- Description: Adds missing components with existence checks
-- ============================================

-- 1. Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create triggers only if they don't exist
DO $$
BEGIN
    -- Check and create trigger for objekt
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_objekt_updated_at') THEN
        CREATE TRIGGER update_objekt_updated_at BEFORE UPDATE ON objekt
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for kontakter
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_kontakter_updated_at') THEN
        CREATE TRIGGER update_kontakter_updated_at BEFORE UPDATE ON kontakter
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for visningar
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_visningar_updated_at') THEN
        CREATE TRIGGER update_visningar_updated_at BEFORE UPDATE ON visningar
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for bud
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bud_updated_at') THEN
        CREATE TRIGGER update_bud_updated_at BEFORE UPDATE ON bud
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for uppgifter
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_uppgifter_updated_at') THEN
        CREATE TRIGGER update_uppgifter_updated_at BEFORE UPDATE ON uppgifter
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for kalenderhändelser
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_kalenderhändelser_updated_at') THEN
        CREATE TRIGGER update_kalenderhändelser_updated_at BEFORE UPDATE ON kalenderhändelser
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for users
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for property_images if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_images') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_property_images_updated_at') THEN
            CREATE TRIGGER update_property_images_updated_at BEFORE UPDATE ON property_images
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- 3. Add missing fields to objekt table (check each column first)
DO $$
BEGIN
    -- Add fastighetsbeteckning if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'fastighetsbeteckning') THEN
        ALTER TABLE objekt ADD COLUMN fastighetsbeteckning VARCHAR(255);
    END IF;

    -- Add lagfart_datum if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'lagfart_datum') THEN
        ALTER TABLE objekt ADD COLUMN lagfart_datum DATE;
    END IF;

    -- Add pantbrev_belopp if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'pantbrev_belopp') THEN
        ALTER TABLE objekt ADD COLUMN pantbrev_belopp NUMERIC(12,2);
    END IF;

    -- Add driftskostnad if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'driftskostnad') THEN
        ALTER TABLE objekt ADD COLUMN driftskostnad NUMERIC(10,2);
    END IF;

    -- Add avgift_manad if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'avgift_manad') THEN
        ALTER TABLE objekt ADD COLUMN avgift_manad NUMERIC(10,2);
    END IF;

    -- Add energiklass if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'energiklass') THEN
        ALTER TABLE objekt ADD COLUMN energiklass VARCHAR(10);
    END IF;

    -- Add vaningsplan if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'vaningsplan') THEN
        ALTER TABLE objekt ADD COLUMN vaningsplan VARCHAR(50);
    END IF;

    -- Add hiss if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'hiss') THEN
        ALTER TABLE objekt ADD COLUMN hiss BOOLEAN DEFAULT false;
    END IF;

    -- Add balkong if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'balkong') THEN
        ALTER TABLE objekt ADD COLUMN balkong BOOLEAN DEFAULT false;
    END IF;

    -- Add forrad if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'forrad') THEN
        ALTER TABLE objekt ADD COLUMN forrad BOOLEAN DEFAULT false;
    END IF;

    -- Add parkering if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'parkering') THEN
        ALTER TABLE objekt ADD COLUMN parkering VARCHAR(100);
    END IF;

    -- Add taxeringsvarde if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'taxeringsvarde') THEN
        ALTER TABLE objekt ADD COLUMN taxeringsvarde NUMERIC(12,2);
    END IF;

    -- Add taxeringsar if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'taxeringsar') THEN
        ALTER TABLE objekt ADD COLUMN taxeringsar INTEGER;
    END IF;

    -- Add is_public if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'is_public') THEN
        ALTER TABLE objekt ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    -- Add user_id if not exists (for compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'user_id') THEN
        ALTER TABLE objekt ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 4. Create dokument table if not exists
CREATE TABLE IF NOT EXISTS dokument (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dokument_nummer VARCHAR(50) UNIQUE,
    namn VARCHAR(255) NOT NULL,
    typ VARCHAR(50) NOT NULL,
    beskrivning TEXT,
    fil_url TEXT,
    fil_namn VARCHAR(255),
    fil_storlek BIGINT,
    objekt_id UUID REFERENCES objekt(id) ON DELETE CASCADE,
    kontakt_id UUID REFERENCES kontakter(id) ON DELETE SET NULL,
    uppladdad_av UUID REFERENCES users(id),
    giltig_from DATE,
    giltig_tom DATE,
    signerad BOOLEAN DEFAULT false,
    signerad_datum TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create dokumentmallar table if not exists
CREATE TABLE IF NOT EXISTS dokumentmallar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    namn VARCHAR(255) NOT NULL,
    typ VARCHAR(50) NOT NULL,
    beskrivning TEXT,
    innehall TEXT,
    placeholders JSONB,
    kategori VARCHAR(50),
    aktiv BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create intresseanmalan table if not exists
CREATE TABLE IF NOT EXISTS intresseanmalan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intresse_nummer VARCHAR(50) UNIQUE,
    objekt_id UUID NOT NULL REFERENCES objekt(id) ON DELETE CASCADE,
    kontakt_id UUID NOT NULL REFERENCES kontakter(id) ON DELETE CASCADE,
    datum DATE DEFAULT CURRENT_DATE,
    tid TIME DEFAULT CURRENT_TIME,
    kanal VARCHAR(50),
    kommentar TEXT,
    prioritet VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'ny',
    uppfoljd BOOLEAN DEFAULT false,
    uppfoljd_datum DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create bud_historik table if not exists
CREATE TABLE IF NOT EXISTS bud_historik (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bud_id UUID NOT NULL REFERENCES bud(id) ON DELETE CASCADE,
    objekt_id UUID NOT NULL REFERENCES objekt(id) ON DELETE CASCADE,
    spekulant_id UUID NOT NULL REFERENCES kontakter(id) ON DELETE CASCADE,
    belopp NUMERIC(12,2) NOT NULL,
    status VARCHAR(50),
    kommentar TEXT,
    andrad_av UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create marknadsstatistik table if not exists
CREATE TABLE IF NOT EXISTS marknadsstatistik (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    omrade VARCHAR(255) NOT NULL,
    kommun VARCHAR(100),
    lan VARCHAR(100),
    period_start DATE NOT NULL,
    period_slut DATE NOT NULL,
    objekt_typ VARCHAR(50),
    antal_salda INTEGER,
    medelpris NUMERIC(12,2),
    mediapris NUMERIC(12,2),
    pris_per_kvm NUMERIC(10,2),
    forsaljningstid_dagar INTEGER,
    prisutveckling_procent NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Enable RLS on new tables
ALTER TABLE dokument ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumentmallar ENABLE ROW LEVEL SECURITY;
ALTER TABLE intresseanmalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE bud_historik ENABLE ROW LEVEL SECURITY;
ALTER TABLE marknadsstatistik ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for new tables
-- Dokument policies
CREATE POLICY "dokument_select" ON dokument FOR SELECT USING (true);
CREATE POLICY "dokument_insert" ON dokument FOR INSERT WITH CHECK (auth.uid() = uppladdad_av);
CREATE POLICY "dokument_update" ON dokument FOR UPDATE USING (auth.uid() = uppladdad_av);
CREATE POLICY "dokument_delete" ON dokument FOR DELETE USING (auth.uid() = uppladdad_av);

-- Dokumentmallar policies
CREATE POLICY "dokumentmallar_select" ON dokumentmallar FOR SELECT USING (true);
CREATE POLICY "dokumentmallar_insert" ON dokumentmallar FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'maklare'))
);
CREATE POLICY "dokumentmallar_update" ON dokumentmallar FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'maklare'))
);

-- Intresseanmalan policies
CREATE POLICY "intresse_select" ON intresseanmalan FOR SELECT USING (true);
CREATE POLICY "intresse_insert" ON intresseanmalan FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
);
CREATE POLICY "intresse_update" ON intresseanmalan FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
);

-- Bud historik policies
CREATE POLICY "bud_historik_select" ON bud_historik FOR SELECT USING (true);
CREATE POLICY "bud_historik_insert" ON bud_historik FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
);

-- Marknadsstatistik policies
CREATE POLICY "stats_select" ON marknadsstatistik FOR SELECT USING (true);
CREATE POLICY "stats_insert" ON marknadsstatistik FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'maklare'))
);
CREATE POLICY "stats_update" ON marknadsstatistik FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'maklare'))
);

-- 11. Create sequences if not exists
CREATE SEQUENCE IF NOT EXISTS dokument_nummer_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS intresse_nummer_seq START 1;

-- 12. Create triggers for new tables only if they don't exist
DO $$
BEGIN
    -- Trigger for dokument
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dokument') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dokument_updated_at') THEN
            CREATE TRIGGER update_dokument_updated_at BEFORE UPDATE ON dokument
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;

    -- Trigger for dokumentmallar
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dokumentmallar') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dokumentmallar_updated_at') THEN
            CREATE TRIGGER update_dokumentmallar_updated_at BEFORE UPDATE ON dokumentmallar
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;

    -- Trigger for intresseanmalan
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intresseanmalan') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_intresseanmalan_updated_at') THEN
            CREATE TRIGGER update_intresseanmalan_updated_at BEFORE UPDATE ON intresseanmalan
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;

    -- Trigger for marknadsstatistik
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marknadsstatistik') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_marknadsstatistik_updated_at') THEN
            CREATE TRIGGER update_marknadsstatistik_updated_at BEFORE UPDATE ON marknadsstatistik
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- 13. Add Vitec integration fields to objekt if needed
DO $$
BEGIN
    -- Add vitec_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'vitec_id') THEN
        ALTER TABLE objekt ADD COLUMN vitec_id VARCHAR(100);
    END IF;

    -- Add vitec_status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'vitec_status') THEN
        ALTER TABLE objekt ADD COLUMN vitec_status VARCHAR(50);
    END IF;

    -- Add vitec_sync_date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'vitec_sync_date') THEN
        ALTER TABLE objekt ADD COLUMN vitec_sync_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add booli_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'booli_id') THEN
        ALTER TABLE objekt ADD COLUMN booli_id VARCHAR(100);
    END IF;

    -- Add hemnet_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'objekt' AND column_name = 'hemnet_id') THEN
        ALTER TABLE objekt ADD COLUMN hemnet_id VARCHAR(100);
    END IF;
END $$;

-- 14. Add GDPR compliance fields to kontakter
DO $$
BEGIN
    -- Add gdpr_samtycke if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kontakter' AND column_name = 'gdpr_samtycke') THEN
        ALTER TABLE kontakter ADD COLUMN gdpr_samtycke BOOLEAN DEFAULT false;
    END IF;

    -- Add gdpr_samtycke_datum if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kontakter' AND column_name = 'gdpr_samtycke_datum') THEN
        ALTER TABLE kontakter ADD COLUMN gdpr_samtycke_datum DATE;
    END IF;

    -- Add marknadsforings_samtycke if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kontakter' AND column_name = 'marknadsforings_samtycke') THEN
        ALTER TABLE kontakter ADD COLUMN marknadsforings_samtycke BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'Safe migration completed successfully. All components checked before creation.';
END $$;