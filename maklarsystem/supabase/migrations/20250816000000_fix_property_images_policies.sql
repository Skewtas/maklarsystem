-- Fix property_images RLS policies to reference objekt instead of properties
-- and add missing performance indexes

-- Drop existing policies with incorrect references
DROP POLICY IF EXISTS "property_images_select_policy" ON property_images;
DROP POLICY IF EXISTS "property_images_insert_policy" ON property_images;
DROP POLICY IF EXISTS "property_images_update_policy" ON property_images;
DROP POLICY IF EXISTS "property_images_delete_policy" ON property_images;

-- Create new policies that reference the correct objekt table
CREATE POLICY "property_images_select_policy" ON property_images
    FOR SELECT USING (
        -- Public can view images for public properties
        EXISTS (
            SELECT 1 FROM objekt
            WHERE objekt.id = property_images.objekt_id
            AND objekt.is_public = true
        )
        OR
        -- Authenticated users can view their own images
        auth.uid() = user_id
        OR
        -- Authenticated users can view images for properties they're associated with
        EXISTS (
            SELECT 1 FROM objekt
            WHERE objekt.id = property_images.objekt_id
            AND objekt.user_id = auth.uid()
        )
    );

CREATE POLICY "property_images_insert_policy" ON property_images
    FOR INSERT WITH CHECK (
        -- Users can only insert images for their own properties
        auth.uid() = user_id
        AND
        EXISTS (
            SELECT 1 FROM objekt
            WHERE objekt.id = property_images.objekt_id
            AND objekt.user_id = auth.uid()
        )
    );

CREATE POLICY "property_images_update_policy" ON property_images
    FOR UPDATE USING (
        -- Users can only update their own images
        auth.uid() = user_id
    );

CREATE POLICY "property_images_delete_policy" ON property_images
    FOR DELETE USING (
        -- Users can only delete their own images
        auth.uid() = user_id
    );

-- Add missing performance indexes
CREATE INDEX IF NOT EXISTS idx_property_images_objekt_id 
    ON property_images(objekt_id);

CREATE INDEX IF NOT EXISTS idx_property_images_user_id 
    ON property_images(user_id);

CREATE INDEX IF NOT EXISTS idx_property_images_primary 
    ON property_images(objekt_id, is_primary) 
    WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_property_images_display_order 
    ON property_images(objekt_id, display_order);

-- Add index for floorplan queries
CREATE INDEX IF NOT EXISTS idx_property_images_floorplan 
    ON property_images(objekt_id, is_floorplan) 
    WHERE is_floorplan = true;

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_property_images_objekt_order 
    ON property_images(objekt_id, display_order, is_primary DESC);

-- Add comment to document the fix
COMMENT ON TABLE property_images IS 'Stores images for objekt (properties). Fixed RLS policies to reference objekt table instead of non-existent properties table.';