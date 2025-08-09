BEGIN;
DROP INDEX IF EXISTS public.uq_property_images_primary_per_objekt;
ALTER TABLE public.property_images DROP CONSTRAINT IF EXISTS chk_property_images_display_order_range;
COMMIT;


