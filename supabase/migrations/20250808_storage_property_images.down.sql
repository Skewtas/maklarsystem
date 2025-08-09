BEGIN;
-- Drop policies first
DROP POLICY IF EXISTS storage_property_images_insert_owner ON storage.objects;
DROP POLICY IF EXISTS storage_property_images_select_owner ON storage.objects;
DROP POLICY IF EXISTS storage_property_images_update_owner ON storage.objects;
DROP POLICY IF EXISTS storage_property_images_delete_owner ON storage.objects;

-- Drop bucket and all its objects
SELECT storage.empty_bucket('property-images');
SELECT storage.delete_bucket('property-images');
COMMIT;


