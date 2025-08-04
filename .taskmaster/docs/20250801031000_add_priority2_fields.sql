-- Add Priority 2 Valuable Fields
-- Migration: Add valuable fields for enhanced Swedish real estate system
-- Date: 2025-08-01
-- Description: Priority 2 fields for improved user experience and modern requirements

-- Add new fields to objekt table
ALTER TABLE objekt ADD COLUMN IF NOT EXISTS
  -- Living cost calculation URL
  boendekalkyl_url TEXT,
  
  -- Standard level classification
  standard_niva TEXT CHECK (standard_niva IN (
    'hög', 
    'mycket_hög',
    'normal', 
    'låg',
    'renovering_behövs',
    'totalrenovering_krävs'
  )),
  
  -- Accessibility features
  tillganglighetsanpassad BOOLEAN DEFAULT false,
  
  -- Modern amenities
  laddbox BOOLEAN DEFAULT false,
  solceller BOOLEAN DEFAULT false,
  
  -- Extended energy information
  solceller_kapacitet_kwp DECIMAL(5,2),
  laddbox_typ TEXT CHECK (laddbox_typ IN (
    '1-fas_3.7kW',
    '3-fas_11kW', 
    '3-fas_22kW',
    'dc_snabbladdare'
  )),
  laddbox_antal INTEGER;

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_objekt_standard_niva ON objekt(standard_niva);
CREATE INDEX IF NOT EXISTS idx_objekt_tillganglighetsanpassad ON objekt(tillganglighetsanpassad);
CREATE INDEX IF NOT EXISTS idx_objekt_laddbox ON objekt(laddbox);
CREATE INDEX IF NOT EXISTS idx_objekt_solceller ON objekt(solceller);

-- Add comments for documentation
COMMENT ON COLUMN objekt.boendekalkyl_url IS 'Link to detailed living cost calculation document';
COMMENT ON COLUMN objekt.standard_niva IS 'Overall standard/condition level of the property';
COMMENT ON COLUMN objekt.tillganglighetsanpassad IS 'Whether property has accessibility adaptations';
COMMENT ON COLUMN objekt.laddbox IS 'Whether property has EV charging box installed';
COMMENT ON COLUMN objekt.solceller IS 'Whether property has solar panels installed';
COMMENT ON COLUMN objekt.solceller_kapacitet_kwp IS 'Solar panel capacity in kWp (kilowatt peak)';
COMMENT ON COLUMN objekt.laddbox_typ IS 'Type and capacity of EV charging box';
COMMENT ON COLUMN objekt.laddbox_antal IS 'Number of EV charging points available';