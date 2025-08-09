BEGIN;
-- Recreate a minimal set of the previous policies if needed (best-effort rollback)

-- objekt: drop new
DROP POLICY IF EXISTS objekt_insert_maklare_or_admin ON public.objekt;
DROP POLICY IF EXISTS objekt_select_owner_or_admin ON public.objekt;
DROP POLICY IF EXISTS objekt_update_owner_or_admin ON public.objekt;
DROP POLICY IF EXISTS objekt_delete_owner_or_admin ON public.objekt;

-- users: drop new
DROP POLICY IF EXISTS users_insert_self ON public.users;
DROP POLICY IF EXISTS users_select_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;

-- Note: restoring exact legacy policies omitted to prevent reintroducing multiple permissive issues.
COMMIT;


