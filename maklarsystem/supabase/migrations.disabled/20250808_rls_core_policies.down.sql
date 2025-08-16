BEGIN;
DROP POLICY IF EXISTS notif_select_owner ON public.notifikationer;
DROP POLICY IF EXISTS notif_cud_owner ON public.notifikationer;

DROP POLICY IF EXISTS kal_select_owner ON public."kalenderhändelser";
DROP POLICY IF EXISTS kal_cud_owner ON public."kalenderhändelser";

DROP POLICY IF EXISTS uppg_select_owner ON public.uppgifter;
DROP POLICY IF EXISTS uppg_cud_owner ON public.uppgifter;

DROP POLICY IF EXISTS visn_all_maklare ON public.visningar;

DROP POLICY IF EXISTS bud_all_maklare ON public.bud;

DROP POLICY IF EXISTS maklar_admin_all ON public.maklarsystem;
COMMIT;


