BEGIN;
ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS thumbnail_path text NULL;
COMMIT;


