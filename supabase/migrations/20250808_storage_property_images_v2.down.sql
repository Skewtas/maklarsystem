BEGIN;
-- Drop policies
DROP POLICY IF EXISTS storage_property_images_insert_owner ON storage.objects;
DROP POLICY IF EXISTS storage_property_images_select_owner ON storage.objects;
DROP POLICY IF EXISTS storage_property_images_update_owner ON storage.objects;
DROP POLICY IF EXISTS storage_property_images_delete_owner ON storage.objects;

-- Remove bucket and its objects
DELETE FROM storage.objects WHERE bucket_id='property-images';
DELETE FROM storage.buckets WHERE id='property-images';
COMMIT;


