-- Rollback Migration: Remove Added Fields
-- Use this script to rollback the field additions if needed
-- Date: 2025-08-01

-- Drop indexes first
DROP INDEX IF EXISTS idx_objekt_fastighetsbeteckning;
DROP INDEX IF EXISTS idx_objekt_undertyp;
DROP INDEX IF EXISTS idx_objekt_standard_niva;
DROP INDEX IF EXISTS idx_objekt_tillganglighetsanpassad;
DROP INDEX IF EXISTS idx_objekt_laddbox;
DROP INDEX IF EXISTS idx_objekt_solceller;
DROP INDEX IF EXISTS idx_objekt_miljocertifiering;

-- Drop constraints
ALTER TABLE objekt 
  DROP CONSTRAINT IF EXISTS chk_undertyp,
  DROP CONSTRAINT IF EXISTS chk_standard_niva,
  DROP CONSTRAINT IF EXISTS chk_laddbox_typ,
  DROP CONSTRAINT IF EXISTS chk_grundlaggning,
  DROP CONSTRAINT IF EXISTS chk_planlosning_typ,
  DROP CONSTRAINT IF EXISTS chk_andel_i_forening;

-- Drop Priority 1 columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS fastighetsbeteckning,
  DROP COLUMN IF EXISTS undertyp,
  DROP COLUMN IF EXISTS andel_i_forening,
  DROP COLUMN IF EXISTS andelstal,
  DROP COLUMN IF EXISTS virtuell_visning_url;

-- Drop Priority 2 columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS boendekalkyl_url,
  DROP COLUMN IF EXISTS standard_niva,
  DROP COLUMN IF EXISTS tillganglighetsanpassad,
  DROP COLUMN IF EXISTS laddbox,
  DROP COLUMN IF EXISTS solceller,
  DROP COLUMN IF EXISTS solceller_kapacitet_kwp,
  DROP COLUMN IF EXISTS laddbox_typ,
  DROP COLUMN IF EXISTS laddbox_antal;

-- Drop Priority 3 Financial columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS lagfartskostnad,
  DROP COLUMN IF EXISTS stampelskatt,
  DROP COLUMN IF EXISTS overlatelseavgift,
  DROP COLUMN IF EXISTS skulder_forening,
  DROP COLUMN IF EXISTS ekonomisk_plan_url;

-- Drop Priority 3 Technical columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS grundlaggning,
  DROP COLUMN IF EXISTS bjalkllag,
  DROP COLUMN IF EXISTS stomme,
  DROP COLUMN IF EXISTS planlosning_typ,
  DROP COLUMN IF EXISTS takhojd;

-- Drop Priority 3 Services columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS sophamtning,
  DROP COLUMN IF EXISTS snorojning,
  DROP COLUMN IF EXISTS el_abonnemang,
  DROP COLUMN IF EXISTS forsakringsbolag,
  DROP COLUMN IF EXISTS hemforsakring_ingar;

-- Drop Priority 3 Legal columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS pantsatt,
  DROP COLUMN IF EXISTS inteckningar,
  DROP COLUMN IF EXISTS forkopsratt,
  DROP COLUMN IF EXISTS hembudsklausul,
  DROP COLUMN IF EXISTS andrahandsuthyrning_tillaten;

-- Drop Priority 3 Marketing columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS dronarvideo_url,
  DROP COLUMN IF EXISTS modell_3d_url,
  DROP COLUMN IF EXISTS huvudbild_id,
  DROP COLUMN IF EXISTS bildgalleri_ordning;

-- Drop Priority 3 Historical columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS tidigare_forsaljningar,
  DROP COLUMN IF EXISTS renoveringshistorik,
  DROP COLUMN IF EXISTS skadehistorik;

-- Drop Priority 3 Neighborhood columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS naromradesbeskrivning,
  DROP COLUMN IF EXISTS omradesstatistik,
  DROP COLUMN IF EXISTS prisutveckling_omrade;

-- Drop Priority 3 Environmental columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS miljocertifiering,
  DROP COLUMN IF EXISTS svanenmarkt;

-- Drop Priority 3 Accessibility columns
ALTER TABLE objekt 
  DROP COLUMN IF EXISTS rullstolsanpassad,
  DROP COLUMN IF EXISTS horslinga;