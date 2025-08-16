BEGIN;
DROP TRIGGER IF EXISTS property_images_updated_at ON public.property_images;
DROP POLICY IF EXISTS pi_delete_maklare_or_admin ON public.property_images;
DROP POLICY IF EXISTS pi_update_maklare_or_admin ON public.property_images;
DROP POLICY IF EXISTS pi_insert_maklare_or_admin ON public.property_images;
DROP POLICY IF EXISTS pi_select_maklare_or_admin ON public.property_images;
DROP TABLE IF EXISTS public.property_images;
COMMIT;


