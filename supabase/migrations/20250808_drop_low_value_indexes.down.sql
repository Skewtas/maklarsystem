BEGIN;
-- Restore only if needed (usually not recommended)
CREATE INDEX IF NOT EXISTS idx_notifikationer_last ON public.notifikationer(last);
COMMIT;


