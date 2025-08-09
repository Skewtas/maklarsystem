BEGIN;
-- Ensure functions have a fixed search_path to satisfy security advisor
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) AS ident
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('sync_auth_to_public_users','update_updated_at_column')
  LOOP
    EXECUTE 'ALTER FUNCTION '||r.ident||' SET search_path = public';
  END LOOP;
END$$;
COMMIT;


