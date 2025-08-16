BEGIN;
-- Replace broad ALL policies with explicit INSERT/UPDATE/DELETE to avoid multiple permissive SELECT policies

-- notifikationer
DROP POLICY IF EXISTS notif_cud_owner ON public.notifikationer;
CREATE POLICY notif_insert_owner ON public.notifikationer
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY notif_update_owner ON public.notifikationer
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY notif_delete_owner ON public.notifikationer
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- kalenderhändelser
DROP POLICY IF EXISTS kal_cud_owner ON public."kalenderhändelser";
CREATE POLICY kal_insert_owner ON public."kalenderhändelser"
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY kal_update_owner ON public."kalenderhändelser"
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY kal_delete_owner ON public."kalenderhändelser"
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- uppgifter (strict: skapad_av)
DROP POLICY IF EXISTS uppg_cud_owner ON public.uppgifter;
CREATE POLICY uppg_insert_owner ON public.uppgifter
  FOR INSERT TO authenticated
  WITH CHECK (skapad_av = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY uppg_update_owner ON public.uppgifter
  FOR UPDATE TO authenticated
  USING (skapad_av = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (skapad_av = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY uppg_delete_owner ON public.uppgifter
  FOR DELETE TO authenticated
  USING (skapad_av = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- visningar (mäklare för objekt)
DROP POLICY IF EXISTS visn_all_maklare ON public.visningar;
CREATE POLICY visn_insert_maklare ON public.visningar
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = visningar.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY visn_update_maklare ON public.visningar
  FOR UPDATE TO authenticated
  USING (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = visningar.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = visningar.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY visn_delete_maklare ON public.visningar
  FOR DELETE TO authenticated
  USING (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = visningar.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- bud (mäklare för objekt)
DROP POLICY IF EXISTS bud_all_maklare ON public.bud;
CREATE POLICY bud_insert_maklare ON public.bud
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = bud.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY bud_update_maklare ON public.bud
  FOR UPDATE TO authenticated
  USING (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = bud.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = bud.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY bud_delete_maklare ON public.bud
  FOR DELETE TO authenticated
  USING (EXISTS (
              SELECT 1 FROM public.objekt o
              WHERE o.id = bud.objekt_id AND o.maklare_id = (SELECT auth.uid())
            ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- maklarsystem (admin-only)
DROP POLICY IF EXISTS maklar_admin_all ON public.maklarsystem;
CREATE POLICY maklar_admin_insert ON public.maklarsystem
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY maklar_admin_update ON public.maklarsystem
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY maklar_admin_delete ON public.maklarsystem
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

COMMIT;


