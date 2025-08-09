-- pgTAP policy checks for public.property_images
SET search_path TO test, public;

SELECT plan(5);

-- Table RLS enabled
SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='property_images'),
  'RLS enabled on property_images'
);

-- Policies exist
SELECT ok(
  (SELECT count(*)>0 FROM pg_policies WHERE schemaname='public' AND tablename='property_images' AND policyname='pi_select_maklare_or_admin'),
  'SELECT policy exists'
);
SELECT ok(
  (SELECT count(*)>0 FROM pg_policies WHERE schemaname='public' AND tablename='property_images' AND policyname='pi_insert_maklare_or_admin'),
  'INSERT policy exists'
);
SELECT ok(
  (SELECT count(*)>0 FROM pg_policies WHERE schemaname='public' AND tablename='property_images' AND policyname='pi_update_maklare_or_admin'),
  'UPDATE policy exists'
);
SELECT ok(
  (SELECT count(*)>0 FROM pg_policies WHERE schemaname='public' AND tablename='property_images' AND policyname='pi_delete_maklare_or_admin'),
  'DELETE policy exists'
);

SELECT finish();


