BEGIN;
-- Minimal, conservative policies to clear "RLS Enabled No Policy" and enforce least privilege.

-- notifikationer: owner (user_id) or admin
CREATE POLICY notif_select_owner ON public.notifikationer
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY notif_cud_owner ON public.notifikationer
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- kalenderhändelser: owner (user_id) or admin
CREATE POLICY kal_select_owner ON public."kalenderhändelser"
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY kal_cud_owner ON public."kalenderhändelser"
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- uppgifter: skapad_av eller tilldelad_till eller admin
CREATE POLICY uppg_select_owner ON public.uppgifter
  FOR SELECT TO authenticated
  USING (skapad_av = (SELECT auth.uid()) OR tilldelad_till = (SELECT auth.uid())
         OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));
CREATE POLICY uppg_cud_owner ON public.uppgifter
  FOR ALL TO authenticated
  USING (skapad_av = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (skapad_av = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- visningar: mäklare för objekt eller admin
CREATE POLICY visn_all_maklare ON public.visningar
  FOR ALL TO authenticated
  USING (EXISTS (
          SELECT 1 FROM public.objekt o
          WHERE o.id = visningar.objekt_id AND o.maklare_id = (SELECT auth.uid())
        ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (
          SELECT 1 FROM public.objekt o
          WHERE o.id = visningar.objekt_id AND o.maklare_id = (SELECT auth.uid())
        ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- bud: mäklare för objekt eller admin (konservativt)
CREATE POLICY bud_all_maklare ON public.bud
  FOR ALL TO authenticated
  USING (EXISTS (
          SELECT 1 FROM public.objekt o
          WHERE o.id = bud.objekt_id AND o.maklare_id = (SELECT auth.uid())
        ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (
          SELECT 1 FROM public.objekt o
          WHERE o.id = bud.objekt_id AND o.maklare_id = (SELECT auth.uid())
        ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

-- maklarsystem: admin-only
CREATE POLICY maklar_admin_all ON public.maklarsystem
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'));

COMMIT;


