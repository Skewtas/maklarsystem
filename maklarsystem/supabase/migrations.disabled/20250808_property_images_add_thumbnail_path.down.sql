BEGIN;
ALTER TABLE public.property_images
  DROP COLUMN IF EXISTS thumbnail_path;
COMMIT;


