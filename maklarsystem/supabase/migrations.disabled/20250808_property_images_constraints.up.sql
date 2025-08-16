BEGIN;
-- One primary image per objekt
CREATE UNIQUE INDEX IF NOT EXISTS uq_property_images_primary_per_objekt
  ON public.property_images(objekt_id)
  WHERE is_primary = true;

-- Display order range guard (optional, app enforces too)
ALTER TABLE public.property_images
  ADD CONSTRAINT chk_property_images_display_order_range
  CHECK (display_order IS NULL OR (display_order BETWEEN 1 AND 50));
COMMIT;


