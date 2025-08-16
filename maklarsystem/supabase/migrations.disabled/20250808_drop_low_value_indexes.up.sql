BEGIN;
-- Drop low-selectivity boolean index that is flagged as unused
DROP INDEX IF EXISTS public.idx_notifikationer_last;
COMMIT;


