BEGIN;
-- Consolidate and harden RLS policies for public.objekt and public.users

-- ========== objekt ==========
-- Drop legacy/overlapping policies
DROP POLICY IF EXISTS "Users can delete their own objects" ON public.objekt;
DROP POLICY IF EXISTS "Mäklare can create objekt" ON public.objekt;
DROP POLICY IF EXISTS "Users can insert their own objects" ON public.objekt;
DROP POLICY IF EXISTS "Authenticated users can view objekt" ON public.objekt;
DROP POLICY IF EXISTS "Users can view their own objects" ON public.objekt;
DROP POLICY IF EXISTS "Mäklare can update own objekt" ON public.objekt;
DROP POLICY IF EXISTS "Users can update their own objects" ON public.objekt;

-- Admin helper predicate
-- EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin')

-- INSERT: only mäklare or admin may create; enforce via WITH CHECK
CREATE POLICY objekt_insert_maklare_or_admin ON public.objekt
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin','maklare')
    )
  );

-- SELECT: owner (maklare_id) or admin
CREATE POLICY objekt_select_owner_or_admin ON public.objekt
  FOR SELECT TO authenticated
  USING (
    (maklare_id = (SELECT auth.uid())) OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  );

-- UPDATE: owner (maklare_id) or admin
CREATE POLICY objekt_update_owner_or_admin ON public.objekt
  FOR UPDATE TO authenticated
  USING (
    (maklare_id = (SELECT auth.uid())) OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  )
  WITH CHECK (
    (maklare_id = (SELECT auth.uid())) OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  );

-- DELETE: owner (maklare_id) or admin
CREATE POLICY objekt_delete_owner_or_admin ON public.objekt
  FOR DELETE TO authenticated
  USING (
    (maklare_id = (SELECT auth.uid())) OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  );

-- ========== users ==========
-- Keep service_role bypass; replace other policies with (SELECT auth.uid()) variant
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY users_insert_self ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY users_select_self ON public.users
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

COMMIT;


