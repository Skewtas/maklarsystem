BEGIN;
DROP INDEX IF EXISTS public.idx_bud_objekt_id;
DROP INDEX IF EXISTS public.idx_bud_spekulant_id;

DROP INDEX IF EXISTS public.idx_objekt_saljare_id;
DROP INDEX IF EXISTS public.idx_objekt_kopare_id;

DROP INDEX IF EXISTS public.idx_uppgifter_objekt_id;
DROP INDEX IF EXISTS public.idx_uppgifter_kontakt_id;
DROP INDEX IF EXISTS public.idx_uppgifter_skapad_av;
DROP INDEX IF EXISTS public.idx_uppgifter_tilldelad_till;

DROP INDEX IF EXISTS public.idx_kalenderhandelser_objekt_id;
DROP INDEX IF EXISTS public.idx_kalenderhandelser_kontakt_id;

DROP INDEX IF EXISTS public.idx_visningar_objekt_id;
COMMIT;


