-- Base schema for Maklarsystem (migrated from supabase/schema.sql)
-- Ensure core tables exist before later migrations add columns/indexes/policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'maklare', 'koordinator', 'assistent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE objekt_typ AS ENUM ('villa', 'lagenhet', 'radhus', 'fritidshus', 'tomt');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE objekt_status AS ENUM ('kundbearbetning', 'uppdrag', 'till_salu', 'sald', 'tilltraden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE kontakt_typ AS ENUM ('privatperson', 'foretag');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE kontakt_kategori AS ENUM ('saljare', 'kopare', 'spekulant', 'ovrig');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE visning_typ AS ENUM ('oppen', 'privat', 'digital');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE bud_status AS ENUM ('aktivt', 'accepterat', 'avslaget', 'tillbakadraget');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE kalender_typ AS ENUM ('visning', 'mote', 'kontraktsskrivning', 'tilltraden', 'fotografering', 'ovrig');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE uppgift_status AS ENUM ('ny', 'pagaende', 'klar', 'avbruten');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE uppgift_prioritet AS ENUM ('lag', 'normal', 'hog', 'akut');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE notifikation_typ AS ENUM ('info', 'varning', 'success', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE relaterad_typ AS ENUM ('objekt', 'kontakt', 'uppgift', 'kalender');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role DEFAULT 'maklare',
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create kontakter table
CREATE TABLE IF NOT EXISTS public.kontakter (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    typ kontakt_typ NOT NULL,
    fornamn VARCHAR(100),
    efternamn VARCHAR(100),
    foretag VARCHAR(255),
    email VARCHAR(255),
    telefon VARCHAR(50),
    mobil VARCHAR(50),
    adress VARCHAR(255),
    postnummer VARCHAR(10),
    ort VARCHAR(100),
    personnummer VARCHAR(13),
    organisationsnummer VARCHAR(20),
    kategori kontakt_kategori DEFAULT 'ovrig',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for objektnummer
DO $$ BEGIN
  CREATE SEQUENCE objekt_nummer_seq START 1;
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

-- Create objekt table
CREATE TABLE IF NOT EXISTS public.objekt (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    objektnummer VARCHAR(50) UNIQUE NOT NULL DEFAULT 'OBJ-' || LPAD(NEXTVAL('objekt_nummer_seq')::TEXT, 6, '0'),
    typ objekt_typ NOT NULL,
    status objekt_status DEFAULT 'kundbearbetning',
    adress VARCHAR(255) NOT NULL,
    postnummer VARCHAR(10) NOT NULL,
    ort VARCHAR(100) NOT NULL,
    kommun VARCHAR(100) NOT NULL,
    lan VARCHAR(100) NOT NULL,
    utgangspris DECIMAL(12, 2),
    slutpris DECIMAL(12, 2),
    boarea INTEGER,
    biarea INTEGER,
    tomtarea INTEGER,
    rum INTEGER,
    byggaar INTEGER,
    maklare_id UUID NOT NULL REFERENCES public.users(id),
    saljare_id UUID REFERENCES public.kontakter(id),
    kopare_id UUID REFERENCES public.kontakter(id),
    beskrivning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create visningar table
CREATE TABLE IF NOT EXISTS public.visningar (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    objekt_id UUID NOT NULL REFERENCES public.objekt(id) ON DELETE CASCADE,
    datum DATE NOT NULL,
    starttid TIME NOT NULL,
    sluttid TIME NOT NULL,
    typ visning_typ DEFAULT 'oppen',
    antal_besokare INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bud table
CREATE TABLE IF NOT EXISTS public.bud (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    objekt_id UUID NOT NULL REFERENCES public.objekt(id) ON DELETE CASCADE,
    spekulant_id UUID NOT NULL REFERENCES public.kontakter(id),
    belopp DECIMAL(12, 2) NOT NULL,
    datum DATE DEFAULT CURRENT_DATE,
    tid TIME DEFAULT CURRENT_TIME,
    status bud_status DEFAULT 'aktivt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create kalenderhändelser table
CREATE TABLE IF NOT EXISTS public."kalenderhändelser" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    beskrivning TEXT,
    starttid TIMESTAMP WITH TIME ZONE NOT NULL,
    sluttid TIMESTAMP WITH TIME ZONE NOT NULL,
    typ kalender_typ DEFAULT 'ovrig',
    plats VARCHAR(255),
    objekt_id UUID REFERENCES public.objekt(id) ON DELETE SET NULL,
    kontakt_id UUID REFERENCES public.kontakter(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create uppgifter table
CREATE TABLE IF NOT EXISTS public.uppgifter (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    beskrivning TEXT,
    status uppgift_status DEFAULT 'ny',
    prioritet uppgift_prioritet DEFAULT 'normal',
    deadline TIMESTAMP WITH TIME ZONE,
    objekt_id UUID REFERENCES public.objekt(id) ON DELETE SET NULL,
    kontakt_id UUID REFERENCES public.kontakter(id) ON DELETE SET NULL,
    tilldelad_till UUID NOT NULL REFERENCES public.users(id),
    skapad_av UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifikationer table
CREATE TABLE IF NOT EXISTS public.notifikationer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    titel VARCHAR(255) NOT NULL,
    meddelande TEXT NOT NULL,
    typ notifikation_typ DEFAULT 'info',
    last BOOLEAN DEFAULT FALSE,
    relaterad_till UUID,
    relaterad_typ relaterad_typ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance (IF NOT EXISTS to be safe)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_objekt_status ON public.objekt(status); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_objekt_maklare ON public.objekt(maklare_id); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_kontakter_kategori ON public.kontakter(kategori); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_visningar_objekt ON public.visningar(objekt_id); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_visningar_datum ON public.visningar(datum); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_bud_objekt ON public.bud(objekt_id); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_kalenderhändelser_user ON public."kalenderhändelser"(user_id); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_kalenderhändelser_starttid ON public."kalenderhändelser"(starttid); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_uppgifter_tilldelad ON public.uppgifter(tilldelad_till); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_uppgifter_status ON public.uppgifter(status); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifikationer_user ON public.notifikationer(user_id); EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifikationer_last ON public.notifikationer(user_id, last); EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach updated_at triggers (safe if tables exist)
DO $$ BEGIN CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER update_kontakter_updated_at BEFORE UPDATE ON public.kontakter FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER update_objekt_updated_at BEFORE UPDATE ON public.objekt FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER update_visningar_updated_at BEFORE UPDATE ON public.visningar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER update_bud_updated_at BEFORE UPDATE ON public.bud FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER update_kalenderhändelser_updated_at BEFORE UPDATE ON public."kalenderhändelser" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER update_uppgifter_updated_at BEFORE UPDATE ON public.uppgifter FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kontakter ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.objekt ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visningar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bud ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."kalenderhändelser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.uppgifter ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifikationer ENABLE ROW LEVEL SECURITY;

-- Basic initial policies (may be refined by later migrations)
DO $$ BEGIN
  CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view kontakter" ON public.kontakter FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can create kontakter" ON public.kontakter FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can update kontakter" ON public.kontakter FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view objekt" ON public.objekt FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Mäklare can create objekt" ON public.objekt FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'maklare')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Mäklare can update own objekt" ON public.objekt FOR UPDATE TO authenticated USING (maklare_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



