BEGIN;
-- Re-create only if necessary (avoid duplicates)
CREATE INDEX IF NOT EXISTS idx_bud_objekt ON public.bud(objekt_id);
CREATE INDEX IF NOT EXISTS idx_visningar_objekt ON public.visningar(objekt_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_tilldelad ON public.uppgifter(tilldelad_till);
COMMIT;


