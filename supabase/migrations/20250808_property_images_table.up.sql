BEGIN;

-- Table to track storage objects for property images linked to objekt
CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  objekt_id uuid NOT NULL REFERENCES public.objekt(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  path text NOT NULL, -- storage path in bucket 'property-images'
  caption text NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_floorplan boolean NOT NULL DEFAULT false,
  display_order integer NULL,
  width integer NULL,
  height integer NULL,
  size_bytes bigint NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_property_images_objekt_id ON public.property_images(objekt_id);
CREATE INDEX IF NOT EXISTS idx_property_images_user_id ON public.property_images(user_id);
CREATE INDEX IF NOT EXISTS idx_property_images_display_order ON public.property_images(objekt_id, display_order);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON public.property_images(objekt_id, is_primary);

-- RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Only mäklare for the objekt or admin may view rows
CREATE POLICY pi_select_maklare_or_admin ON public.property_images
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.objekt o
      WHERE o.id = property_images.objekt_id
        AND (o.maklare_id = (SELECT auth.uid()) OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
        ))
    )
  );

-- INSERT restricted to mäklare of objekt or admin
CREATE POLICY pi_insert_maklare_or_admin ON public.property_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.objekt o
      WHERE o.id = objekt_id
        AND (o.maklare_id = (SELECT auth.uid()) OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
        ))
    )
  );

-- UPDATE restricted to mäklare of objekt or admin
CREATE POLICY pi_update_maklare_or_admin ON public.property_images
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.objekt o
      WHERE o.id = property_images.objekt_id
        AND (o.maklare_id = (SELECT auth.uid()) OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
        ))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.objekt o
      WHERE o.id = objekt_id
        AND (o.maklare_id = (SELECT auth.uid()) OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
        ))
    )
  );

-- DELETE restricted similarly
CREATE POLICY pi_delete_maklare_or_admin ON public.property_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.objekt o
      WHERE o.id = property_images.objekt_id
        AND (o.maklare_id = (SELECT auth.uid()) OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
        ))
    )
  );

-- updated_at trigger if function exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER property_images_updated_at
      BEFORE UPDATE ON public.property_images
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

COMMIT;


