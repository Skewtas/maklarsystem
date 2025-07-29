-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'maklare', 'koordinator', 'assistent');
CREATE TYPE objekt_typ AS ENUM ('villa', 'lagenhet', 'radhus', 'fritidshus', 'tomt');
CREATE TYPE objekt_status AS ENUM ('kundbearbetning', 'uppdrag', 'till_salu', 'sald', 'tilltraden');
CREATE TYPE kontakt_typ AS ENUM ('privatperson', 'foretag');
CREATE TYPE kontakt_kategori AS ENUM ('saljare', 'kopare', 'spekulant', 'ovrig');
CREATE TYPE visning_typ AS ENUM ('oppen', 'privat', 'digital');
CREATE TYPE bud_status AS ENUM ('aktivt', 'accepterat', 'avslaget', 'tillbakadraget');
CREATE TYPE kalender_typ AS ENUM ('visning', 'mote', 'kontraktsskrivning', 'tilltraden', 'fotografering', 'ovrig');
CREATE TYPE uppgift_status AS ENUM ('ny', 'pagaende', 'klar', 'avbruten');
CREATE TYPE uppgift_prioritet AS ENUM ('lag', 'normal', 'hog', 'akut');
CREATE TYPE notifikation_typ AS ENUM ('info', 'varning', 'success', 'error');
CREATE TYPE relaterad_typ AS ENUM ('objekt', 'kontakt', 'uppgift', 'kalender');

-- Create users table
CREATE TABLE users (
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
CREATE TABLE kontakter (
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
CREATE SEQUENCE objekt_nummer_seq START 1;

-- Create objekt table
CREATE TABLE objekt (
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
    maklare_id UUID NOT NULL REFERENCES users(id),
    saljare_id UUID REFERENCES kontakter(id),
    kopare_id UUID REFERENCES kontakter(id),
    beskrivning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create visningar table
CREATE TABLE visningar (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    objekt_id UUID NOT NULL REFERENCES objekt(id) ON DELETE CASCADE,
    datum DATE NOT NULL,
    starttid TIME NOT NULL,
    sluttid TIME NOT NULL,
    typ visning_typ DEFAULT 'oppen',
    antal_besokare INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bud table
CREATE TABLE bud (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    objekt_id UUID NOT NULL REFERENCES objekt(id) ON DELETE CASCADE,
    spekulant_id UUID NOT NULL REFERENCES kontakter(id),
    belopp DECIMAL(12, 2) NOT NULL,
    datum DATE DEFAULT CURRENT_DATE,
    tid TIME DEFAULT CURRENT_TIME,
    status bud_status DEFAULT 'aktivt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create kalenderhändelser table
CREATE TABLE kalenderhändelser (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    beskrivning TEXT,
    starttid TIMESTAMP WITH TIME ZONE NOT NULL,
    sluttid TIMESTAMP WITH TIME ZONE NOT NULL,
    typ kalender_typ DEFAULT 'ovrig',
    plats VARCHAR(255),
    objekt_id UUID REFERENCES objekt(id) ON DELETE SET NULL,
    kontakt_id UUID REFERENCES kontakter(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create uppgifter table
CREATE TABLE uppgifter (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    beskrivning TEXT,
    status uppgift_status DEFAULT 'ny',
    prioritet uppgift_prioritet DEFAULT 'normal',
    deadline TIMESTAMP WITH TIME ZONE,
    objekt_id UUID REFERENCES objekt(id) ON DELETE SET NULL,
    kontakt_id UUID REFERENCES kontakter(id) ON DELETE SET NULL,
    tilldelad_till UUID NOT NULL REFERENCES users(id),
    skapad_av UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifikationer table
CREATE TABLE notifikationer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titel VARCHAR(255) NOT NULL,
    meddelande TEXT NOT NULL,
    typ notifikation_typ DEFAULT 'info',
    last BOOLEAN DEFAULT FALSE,
    relaterad_till UUID,
    relaterad_typ relaterad_typ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_objekt_status ON objekt(status);
CREATE INDEX idx_objekt_maklare ON objekt(maklare_id);
CREATE INDEX idx_kontakter_kategori ON kontakter(kategori);
CREATE INDEX idx_visningar_objekt ON visningar(objekt_id);
CREATE INDEX idx_visningar_datum ON visningar(datum);
CREATE INDEX idx_bud_objekt ON bud(objekt_id);
CREATE INDEX idx_kalenderhändelser_user ON kalenderhändelser(user_id);
CREATE INDEX idx_kalenderhändelser_starttid ON kalenderhändelser(starttid);
CREATE INDEX idx_uppgifter_tilldelad ON uppgifter(tilldelad_till);
CREATE INDEX idx_uppgifter_status ON uppgifter(status);
CREATE INDEX idx_notifikationer_user ON notifikationer(user_id);
CREATE INDEX idx_notifikationer_last ON notifikationer(user_id, last);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kontakter_updated_at BEFORE UPDATE ON kontakter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objekt_updated_at BEFORE UPDATE ON objekt
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visningar_updated_at BEFORE UPDATE ON visningar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bud_updated_at BEFORE UPDATE ON bud
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kalenderhändelser_updated_at BEFORE UPDATE ON kalenderhändelser
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uppgifter_updated_at BEFORE UPDATE ON uppgifter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontakter ENABLE ROW LEVEL SECURITY;
ALTER TABLE objekt ENABLE ROW LEVEL SECURITY;
ALTER TABLE visningar ENABLE ROW LEVEL SECURITY;
ALTER TABLE bud ENABLE ROW LEVEL SECURITY;
ALTER TABLE kalenderhändelser ENABLE ROW LEVEL SECURITY;
ALTER TABLE uppgifter ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikationer ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be expanded)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view kontakter" ON kontakter FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create kontakter" ON kontakter FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kontakter" ON kontakter FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view objekt" ON objekt FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mäklare can create objekt" ON objekt FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'maklare')));
CREATE POLICY "Mäklare can update own objekt" ON objekt FOR UPDATE TO authenticated USING (maklare_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Add similar policies for other tables... 