-- Migration: Add extended fields columns to objekt table
-- Created: 2025-01-29 10:43:01
-- Description: Add all new columns for extended property information

-- Add columns to objekt table
-- 1. UTÖKAD FASTIGHETSINFORMATION
ALTER TABLE objekt 
ADD COLUMN IF NOT EXISTS balkong_terrass BOOLEAN,
ADD COLUMN IF NOT EXISTS hiss BOOLEAN,
ADD COLUMN IF NOT EXISTS vaning INTEGER CHECK (vaning >= -2 AND vaning <= 50),
ADD COLUMN IF NOT EXISTS kok kok_typ,
ADD COLUMN IF NOT EXISTS badrum_antal INTEGER CHECK (badrum_antal >= 0 AND badrum_antal <= 10),
ADD COLUMN IF NOT EXISTS garage TEXT,
ADD COLUMN IF NOT EXISTS forrad BOOLEAN,
ADD COLUMN IF NOT EXISTS tradgard BOOLEAN,
ADD COLUMN IF NOT EXISTS pool BOOLEAN,
ADD COLUMN IF NOT EXISTS kamin BOOLEAN,

-- 2. TEKNISK INFORMATION
ADD COLUMN IF NOT EXISTS energiklass energiklass_typ,
ADD COLUMN IF NOT EXISTS byggmaterial byggmaterial_typ,
ADD COLUMN IF NOT EXISTS uppvarmning uppvarmning_typ,
ADD COLUMN IF NOT EXISTS ventilation ventilation_typ,
ADD COLUMN IF NOT EXISTS elnat elnat_typ,
ADD COLUMN IF NOT EXISTS isolering isolering_typ,
ADD COLUMN IF NOT EXISTS elforbrukning DECIMAL(8,2) CHECK (elforbrukning >= 0),
ADD COLUMN IF NOT EXISTS vattenforbrukning DECIMAL(8,2) CHECK (vattenforbrukning >= 0),
ADD COLUMN IF NOT EXISTS uppvarmningskostnad DECIMAL(10,2) CHECK (uppvarmningskostnad >= 0),

-- 3. BYGGNAD OCH KONSTRUKTION
ADD COLUMN IF NOT EXISTS bygglov TEXT,
ADD COLUMN IF NOT EXISTS senaste_renovering DATE,
ADD COLUMN IF NOT EXISTS taktyp taktyp_typ,
ADD COLUMN IF NOT EXISTS fasadmaterial fasadmaterial_typ,
ADD COLUMN IF NOT EXISTS fonstertyp fonstertyp_typ,
ADD COLUMN IF NOT EXISTS vatten_avlopp TEXT,

-- 4. SÄKERHET OCH SYSTEM
ADD COLUMN IF NOT EXISTS brandskydd TEXT,
ADD COLUMN IF NOT EXISTS larm TEXT,
ADD COLUMN IF NOT EXISTS bredband bredband_typ,
ADD COLUMN IF NOT EXISTS kabel_tv BOOLEAN,
ADD COLUMN IF NOT EXISTS internet TEXT,

-- 5. LÄGE OCH OMGIVNING
ADD COLUMN IF NOT EXISTS narmaste_skola TEXT,
ADD COLUMN IF NOT EXISTS narmaste_vardcentral TEXT,
ADD COLUMN IF NOT EXISTS narmaste_dagis TEXT,
ADD COLUMN IF NOT EXISTS avstand_centrum DECIMAL(5,2) CHECK (avstand_centrum >= 0),
ADD COLUMN IF NOT EXISTS havsnara BOOLEAN,
ADD COLUMN IF NOT EXISTS sjonara BOOLEAN,
ADD COLUMN IF NOT EXISTS skogsnara BOOLEAN,
ADD COLUMN IF NOT EXISTS kollektivtrafik TEXT,
ADD COLUMN IF NOT EXISTS parkering TEXT,

-- 6. EKONOMI (UTÖKAD)
ADD COLUMN IF NOT EXISTS driftkostnad DECIMAL(10,2) CHECK (driftkostnad >= 0),
ADD COLUMN IF NOT EXISTS avgift DECIMAL(10,2) CHECK (avgift >= 0),
ADD COLUMN IF NOT EXISTS pantbrev DECIMAL(12,2) CHECK (pantbrev >= 0),
ADD COLUMN IF NOT EXISTS taxeringsvarde DECIMAL(12,2) CHECK (taxeringsvarde >= 0),
ADD COLUMN IF NOT EXISTS kommunala_avgifter DECIMAL(10,2) CHECK (kommunala_avgifter >= 0),
ADD COLUMN IF NOT EXISTS forsakringskostnad DECIMAL(10,2) CHECK (forsakringskostnad >= 0),
ADD COLUMN IF NOT EXISTS reparationsfond DECIMAL(10,2) CHECK (reparationsfond >= 0),

-- 7. TILLGÄNGLIGHET
ADD COLUMN IF NOT EXISTS tillgangsdatum DATE,
ADD COLUMN IF NOT EXISTS visningsinfo TEXT;

-- Add comments to columns for documentation
COMMENT ON COLUMN objekt.balkong_terrass IS 'Has balcony or terrace';
COMMENT ON COLUMN objekt.hiss IS 'Has elevator access';
COMMENT ON COLUMN objekt.vaning IS 'Floor number (-2 for basement levels)';
COMMENT ON COLUMN objekt.kok IS 'Kitchen type classification';
COMMENT ON COLUMN objekt.badrum_antal IS 'Number of bathrooms';
COMMENT ON COLUMN objekt.garage IS 'Garage information (free text)';
COMMENT ON COLUMN objekt.forrad IS 'Has storage space';
COMMENT ON COLUMN objekt.tradgard IS 'Has garden';
COMMENT ON COLUMN objekt.pool IS 'Has swimming pool';
COMMENT ON COLUMN objekt.kamin IS 'Has fireplace';

COMMENT ON COLUMN objekt.energiklass IS 'Energy efficiency class A-G';
COMMENT ON COLUMN objekt.byggmaterial IS 'Primary building material';
COMMENT ON COLUMN objekt.uppvarmning IS 'Heating system type';
COMMENT ON COLUMN objekt.ventilation IS 'Ventilation system type';
COMMENT ON COLUMN objekt.elnat IS 'Electrical system specification';
COMMENT ON COLUMN objekt.isolering IS 'Insulation material type';
COMMENT ON COLUMN objekt.elforbrukning IS 'Annual electricity consumption (kWh)';
COMMENT ON COLUMN objekt.vattenforbrukning IS 'Annual water consumption (m³)';
COMMENT ON COLUMN objekt.uppvarmningskostnad IS 'Annual heating cost (SEK)';

COMMENT ON COLUMN objekt.bygglov IS 'Building permit information';
COMMENT ON COLUMN objekt.senaste_renovering IS 'Date of last major renovation';
COMMENT ON COLUMN objekt.taktyp IS 'Roof construction type';
COMMENT ON COLUMN objekt.fasadmaterial IS 'Facade material type';
COMMENT ON COLUMN objekt.fonstertyp IS 'Window construction type';
COMMENT ON COLUMN objekt.vatten_avlopp IS 'Water and sewage system information';

COMMENT ON COLUMN objekt.brandskydd IS 'Fire safety system information';
COMMENT ON COLUMN objekt.larm IS 'Alarm system information';
COMMENT ON COLUMN objekt.bredband IS 'Broadband connection type';
COMMENT ON COLUMN objekt.kabel_tv IS 'Has cable TV connection';
COMMENT ON COLUMN objekt.internet IS 'Internet connectivity information';

COMMENT ON COLUMN objekt.narmaste_skola IS 'Nearest school information';
COMMENT ON COLUMN objekt.narmaste_vardcentral IS 'Nearest healthcare center';
COMMENT ON COLUMN objekt.narmaste_dagis IS 'Nearest daycare center';
COMMENT ON COLUMN objekt.avstand_centrum IS 'Distance to city center (km)';
COMMENT ON COLUMN objekt.havsnara IS 'Close to sea/ocean';
COMMENT ON COLUMN objekt.sjonara IS 'Close to lake';
COMMENT ON COLUMN objekt.skogsnara IS 'Close to forest';
COMMENT ON COLUMN objekt.kollektivtrafik IS 'Public transport accessibility';
COMMENT ON COLUMN objekt.parkering IS 'Parking information';

COMMENT ON COLUMN objekt.driftkostnad IS 'Annual operating costs (SEK)';
COMMENT ON COLUMN objekt.avgift IS 'Monthly maintenance fee (SEK)';
COMMENT ON COLUMN objekt.pantbrev IS 'Mortgage deed amount (SEK)';
COMMENT ON COLUMN objekt.taxeringsvarde IS 'Tax assessment value (SEK)';
COMMENT ON COLUMN objekt.kommunala_avgifter IS 'Municipal fees (SEK)';
COMMENT ON COLUMN objekt.forsakringskostnad IS 'Insurance cost (SEK)';
COMMENT ON COLUMN objekt.reparationsfond IS 'Repair fund amount (SEK)';

COMMENT ON COLUMN objekt.tillgangsdatum IS 'Property access/availability date';
COMMENT ON COLUMN objekt.visningsinfo IS 'Viewing schedule and information'; 