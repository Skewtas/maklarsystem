BEGIN;
-- Create private bucket for property images
SELECT storage.create_bucket('property-images', jsonb_build_object('public', false));

-- Minimal RLS for storage.objects (bucket scoped)
-- Allow owners to manage their own uploads in this bucket; admins bypass via app server
CREATE POLICY storage_property_images_insert_owner ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' AND (owner = (SELECT auth.uid()))
  );

CREATE POLICY storage_property_images_select_owner ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-images' AND (owner = (SELECT auth.uid()))
  );

CREATE POLICY storage_property_images_update_owner ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'property-images' AND (owner = (SELECT auth.uid()))
  )
  WITH CHECK (
    bucket_id = 'property-images' AND (owner = (SELECT auth.uid()))
  );

CREATE POLICY storage_property_images_delete_owner ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-images' AND (owner = (SELECT auth.uid()))
  );

COMMIT;


