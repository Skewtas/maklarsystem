-- Requires pgtap installed in schema test (see migration 20250808_move_pgtap_schema)
SET search_path TO test, public;

SELECT plan(3);

-- Tables exists
SELECT has_table('public', 'property_images', 'property_images table exists');

-- Required columns exist
SELECT has_column('public', 'property_images', 'objekt_id', 'objekt_id exists');
SELECT has_column('public', 'property_images', 'user_id', 'user_id exists');

SELECT finish();






