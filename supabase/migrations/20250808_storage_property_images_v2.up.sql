BEGIN;
-- Create bucket via direct insert (compatible across versions)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images','property-images', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for this bucket (idempotent via IF NOT EXISTS not supported; safe to re-run due to names)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='storage_property_images_insert_owner'
  ) THEN
    CREATE POLICY storage_property_images_insert_owner ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'property-images' AND owner = (SELECT auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='storage_property_images_select_owner'
  ) THEN
    CREATE POLICY storage_property_images_select_owner ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'property-images' AND owner = (SELECT auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='storage_property_images_update_owner'
  ) THEN
    CREATE POLICY storage_property_images_update_owner ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'property-images' AND owner = (SELECT auth.uid()))
      WITH CHECK (bucket_id = 'property-images' AND owner = (SELECT auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='storage_property_images_delete_owner'
  ) THEN
    CREATE POLICY storage_property_images_delete_owner ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'property-images' AND owner = (SELECT auth.uid()));
  END IF;
END $$;

COMMIT;


