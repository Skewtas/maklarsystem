-- Consolidated Migration: Add All Missing Fields to Objekt Table
-- Migration: Complete field additions for Swedish real estate system
-- Date: 2025-08-01
-- Description: Comprehensive migration adding all identified missing fields

-- Priority 1: Essential Fields
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  fastighetsbeteckning TEXT,
  undertyp TEXT,
  andel_i_forening DECIMAL(5,2),
  andelstal DECIMAL(10,6),
  virtuell_visning_url TEXT;

-- Priority 2: Valuable Fields  
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  boendekalkyl_url TEXT,
  standard_niva TEXT,
  tillganglighetsanpassad BOOLEAN DEFAULT false,
  laddbox BOOLEAN DEFAULT false,
  solceller BOOLEAN DEFAULT false,
  solceller_kapacitet_kwp DECIMAL(5,2),
  laddbox_typ TEXT,
  laddbox_antal INTEGER;

-- Priority 3: Additional Financial Fields
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  lagfartskostnad INTEGER,
  stampelskatt INTEGER,
  overlatelseavgift INTEGER,
  skulder_forening BIGINT,
  ekonomisk_plan_url TEXT;

-- Priority 3: Technical Specifications
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  grundlaggning TEXT,
  bjalkllag TEXT,
  stomme TEXT,
  planlosning_typ TEXT,
  takhojd DECIMAL(3,1);

-- Priority 3: Additional Services
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  sophamtning TEXT,
  snorojning TEXT,
  el_abonnemang TEXT,
  forsakringsbolag TEXT,
  hemforsakring_ingar BOOLEAN DEFAULT false;

-- Priority 3: Legal and Administrative
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  pantsatt BOOLEAN DEFAULT false,
  inteckningar TEXT,
  forkopsratt TEXT,
  hembudsklausul TEXT,
  andrahandsuthyrning_tillaten BOOLEAN DEFAULT false;

-- Priority 3: Marketing and Media
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  dronarvideo_url TEXT,
  modell_3d_url TEXT,
  huvudbild_id TEXT,
  bildgalleri_ordning JSONB;

-- Priority 3: Historical Data
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  tidigare_forsaljningar JSONB,
  renoveringshistorik JSONB,
  skadehistorik JSONB;

-- Priority 3: Neighborhood
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  naromradesbeskrivning TEXT,
  omradesstatistik JSONB,
  prisutveckling_omrade JSONB;

-- Priority 3: Environmental
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  miljocertifiering TEXT,
  svanenmarkt BOOLEAN DEFAULT false;

-- Priority 3: Accessibility Details
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  rullstolsanpassad BOOLEAN DEFAULT false,
  horslinga BOOLEAN DEFAULT false;

-- Add CHECK constraints
ALTER TABLE objekt 
  ADD CONSTRAINT chk_undertyp CHECK (undertyp IN (
    'parhus', 'kedjehus', 'radhus_mellan', 'radhus_gavelbostad',
    'enplansvilla', 'tvåplansvilla', 'souterrangvilla', 'sluttningshus',
    'atriumhus', 'funkisvilla', 'herrgård', 'torp',
    'sjötomt', 'skogstomt', 'åkertomt'
  )),
  ADD CONSTRAINT chk_standard_niva CHECK (standard_niva IN (
    'hög', 'mycket_hög', 'normal', 'låg', 
    'renovering_behövs', 'totalrenovering_krävs'
  )),
  ADD CONSTRAINT chk_laddbox_typ CHECK (laddbox_typ IN (
    '1-fas_3.7kW', '3-fas_11kW', '3-fas_22kW', 'dc_snabbladdare'
  )),
  ADD CONSTRAINT chk_grundlaggning CHECK (grundlaggning IN (
    'platta', 'källare', 'krypgrund', 'torpargrund', 'pålar'
  )),
  ADD CONSTRAINT chk_planlosning_typ CHECK (planlosning_typ IN (
    'öppen', 'traditionell', 'genomgående', 'enfilade', 'flexibel'
  )),
  ADD CONSTRAINT chk_andel_i_forening CHECK (
    andel_i_forening >= 0 AND andel_i_forening <= 100
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_objekt_fastighetsbeteckning ON objekt(fastighetsbeteckning);
CREATE INDEX IF NOT EXISTS idx_objekt_undertyp ON objekt(undertyp);
CREATE INDEX IF NOT EXISTS idx_objekt_standard_niva ON objekt(standard_niva);
CREATE INDEX IF NOT EXISTS idx_objekt_tillganglighetsanpassad ON objekt(tillganglighetsanpassad);
CREATE INDEX IF NOT EXISTS idx_objekt_laddbox ON objekt(laddbox);
CREATE INDEX IF NOT EXISTS idx_objekt_solceller ON objekt(solceller);
CREATE INDEX IF NOT EXISTS idx_objekt_miljocertifiering ON objekt(miljocertifiering);

-- Add comprehensive comments
COMMENT ON COLUMN objekt.fastighetsbeteckning IS 'Official property designation from Lantmäteriet';
COMMENT ON COLUMN objekt.undertyp IS 'Specific sub-type of property for detailed classification';
COMMENT ON COLUMN objekt.andel_i_forening IS 'Percentage share in housing cooperative (bostadsrätt)';
COMMENT ON COLUMN objekt.andelstal IS 'Share ratio for cost distribution in cooperatives';
COMMENT ON COLUMN objekt.virtuell_visning_url IS 'URL to virtual tour or 3D walkthrough';
COMMENT ON COLUMN objekt.boendekalkyl_url IS 'Link to detailed living cost calculation';
COMMENT ON COLUMN objekt.standard_niva IS 'Overall standard/condition level of property';
COMMENT ON COLUMN objekt.tillganglighetsanpassad IS 'Accessibility adaptations present';
COMMENT ON COLUMN objekt.laddbox IS 'EV charging box installed';
COMMENT ON COLUMN objekt.solceller IS 'Solar panels installed';
COMMENT ON COLUMN objekt.tidigare_forsaljningar IS 'JSON array of previous sales with date and price';
COMMENT ON COLUMN objekt.renoveringshistorik IS 'JSON array of renovations with date and description';
COMMENT ON COLUMN objekt.skadehistorik IS 'JSON array of damage history';
COMMENT ON COLUMN objekt.bildgalleri_ordning IS 'JSON array defining image display order';