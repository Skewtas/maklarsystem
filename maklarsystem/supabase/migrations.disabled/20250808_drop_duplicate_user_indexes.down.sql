BEGIN;
-- Recreate only if needed; normally primary key and unique(email) already exist appropriately
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON public.users(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_id_unique ON public.users(id);
COMMIT;


