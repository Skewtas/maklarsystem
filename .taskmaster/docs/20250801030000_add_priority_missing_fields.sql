-- Add Priority 1 Essential Missing Fields
-- Migration: Add essential missing fields for Swedish real estate system
-- Date: 2025-08-01
-- Description: Fields identified as essential after VITEC and Swedish real estate system analysis

-- Add new fields to objekt table
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  -- Official property designation (essential for legal documents)
  fastighetsbeteckning TEXT,
  
  -- More specific property sub-type
  undertyp TEXT CHECK (undertyp IN (
    'parhus', 
    'kedjehus', 
    'radhus_mellan', 
    'radhus_gavelbostad',
    'enplansvilla', 
    'tvåplansvilla',
    'souterrangvilla',
    'sluttningshus',
    'atriumhus',
    'funkisvilla',
    'herrgård',
    'torp',
    'sjötomt',
    'skogstomt',
    'åkertomt'
  )),
  
  -- Share percentage in housing cooperative (bostadsrätt specific)
  andel_i_forening DECIMAL(5,2) CHECK (andel_i_forening >= 0 AND andel_i_forening <= 100),
  
  -- Share ratio (used for cost distribution in cooperatives)
  andelstal DECIMAL(10,6),
  
  -- Virtual tour URL (increasingly important for modern marketing)
  virtuell_visning_url TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_objekt_fastighetsbeteckning ON objekt(fastighetsbeteckning);
CREATE INDEX IF NOT EXISTS idx_objekt_undertyp ON objekt(undertyp);

-- Add comments for documentation
COMMENT ON COLUMN objekt.fastighetsbeteckning IS 'Official property designation from Lantmäteriet';
COMMENT ON COLUMN objekt.undertyp IS 'Specific sub-type of property for more detailed classification';
COMMENT ON COLUMN objekt.andel_i_forening IS 'Percentage share in housing cooperative (bostadsrätt)';
COMMENT ON COLUMN objekt.andelstal IS 'Share ratio used for cost distribution in cooperatives';
COMMENT ON COLUMN objekt.virtuell_visning_url IS 'URL to virtual tour or 3D walkthrough of the property';