BEGIN;
-- Drop duplicate/overlapping constraints reported by advisors
-- email: keep users_email_key, drop users_email_unique
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_unique;
-- id: keep primary key users_pkey, drop users_id_unique
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_unique;
COMMIT;


