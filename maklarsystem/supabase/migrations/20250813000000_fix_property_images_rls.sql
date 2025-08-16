-- Fix RLS policy for property_images table to allow authenticated users to insert images
-- Date: 2025-08-13
-- Issue: "new row violates row-level security policy" when uploading images

-- Drop existing conflicting policies for property_images
DROP POLICY IF EXISTS "Property images are viewable if property is viewable" ON property_images;
DROP POLICY IF EXISTS "Users can manage images for their properties" ON property_images;

-- Create separate policies for each operation to be more specific

-- SELECT: Anyone can view images if the property is public or they own it
CREATE POLICY "Anyone can view property images" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND (
          status IN ('till_salu', 'under_kontrakt', 'sald')
          OR created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- INSERT: Authenticated users can insert images for properties they own
CREATE POLICY "Users can insert images for their properties" ON property_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- UPDATE: Users can update images for properties they own
CREATE POLICY "Users can update images for their properties" ON property_images
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: Users can delete images for properties they own
CREATE POLICY "Users can delete images for their properties" ON property_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policy for full access (simplified)
CREATE POLICY "Admins have full access to property images" ON property_images
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON property_images TO authenticated;
GRANT SELECT ON property_images TO anon;

-- Ensure the user_profiles table exists and has proper data
-- This helps prevent RLS policy failures due to missing profile records
INSERT INTO user_profiles (user_id, display_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'agent')
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
);

-- Verification comment
COMMENT ON POLICY "Users can insert images for their properties" ON property_images 
  IS 'Allows authenticated users to upload images for properties they created';