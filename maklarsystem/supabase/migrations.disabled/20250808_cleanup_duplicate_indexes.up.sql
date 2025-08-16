BEGIN;
-- Drop legacy duplicate indexes; keep our canonical *_id names
DROP INDEX IF EXISTS public.idx_bud_objekt;
DROP INDEX IF EXISTS public.idx_visningar_objekt;
DROP INDEX IF EXISTS public.idx_uppgifter_tilldelad;
COMMIT;


