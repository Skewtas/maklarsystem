-- Safe migration that checks if table exists before applying fixes
-- This version will work regardless of which project you're in

-- First check if property_images table exists
DO $$
BEGIN
    -- Only proceed if property_images table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'property_images'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "property_images_select_policy" ON property_images;
        DROP POLICY IF EXISTS "property_images_insert_policy" ON property_images;
        DROP POLICY IF EXISTS "property_images_update_policy" ON property_images;
        DROP POLICY IF EXISTS "property_images_delete_policy" ON property_images;

        -- Check if objekt table has is_public column
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'objekt' 
            AND column_name = 'is_public'
        ) THEN
            -- Create policies with is_public check
            EXECUTE 'CREATE POLICY "property_images_select_policy" ON property_images
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM objekt
                        WHERE objekt.id = property_images.objekt_id
                        AND objekt.is_public = true
                    )
                    OR
                    auth.uid() = user_id
                    OR
                    EXISTS (
                        SELECT 1 FROM objekt
                        WHERE objekt.id = property_images.objekt_id
                        AND objekt.maklare_id = auth.uid()
                    )
                )';
        ELSE
            -- Create policies without is_public check (since column doesn't exist)
            EXECUTE 'CREATE POLICY "property_images_select_policy" ON property_images
                FOR SELECT USING (
                    auth.uid() = user_id
                    OR
                    EXISTS (
                        SELECT 1 FROM objekt
                        WHERE objekt.id = property_images.objekt_id
                        AND objekt.maklare_id = auth.uid()
                    )
                )';
        END IF;

        -- Create insert policy
        EXECUTE 'CREATE POLICY "property_images_insert_policy" ON property_images
            FOR INSERT WITH CHECK (
                auth.uid() = user_id
                AND
                EXISTS (
                    SELECT 1 FROM objekt
                    WHERE objekt.id = property_images.objekt_id
                    AND objekt.maklare_id = auth.uid()
                )
            )';

        -- Create update policy
        EXECUTE 'CREATE POLICY "property_images_update_policy" ON property_images
            FOR UPDATE USING (
                auth.uid() = user_id
            )';

        -- Create delete policy
        EXECUTE 'CREATE POLICY "property_images_delete_policy" ON property_images
            FOR DELETE USING (
                auth.uid() = user_id
            )';

        RAISE NOTICE 'RLS policies created successfully for property_images table';
    ELSE
        -- If property_images doesn't exist, create it
        CREATE TABLE IF NOT EXISTS property_images (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            objekt_id UUID NOT NULL REFERENCES objekt(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            path TEXT NOT NULL,
            caption TEXT,
            is_primary BOOLEAN DEFAULT false,
            is_floorplan BOOLEAN DEFAULT false,
            display_order INTEGER CHECK (display_order IS NULL OR (display_order >= 1 AND display_order <= 50)),
            width INTEGER,
            height INTEGER,
            size_bytes BIGINT,
            thumbnail_path TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

        -- Create basic policies
        CREATE POLICY "property_images_select_policy" ON property_images
            FOR SELECT USING (
                auth.uid() = user_id
                OR
                EXISTS (
                    SELECT 1 FROM objekt
                    WHERE objekt.id = property_images.objekt_id
                    AND objekt.maklare_id = auth.uid()
                )
            );

        CREATE POLICY "property_images_insert_policy" ON property_images
            FOR INSERT WITH CHECK (
                auth.uid() = user_id
                AND
                EXISTS (
                    SELECT 1 FROM objekt
                    WHERE objekt.id = property_images.objekt_id
                    AND objekt.maklare_id = auth.uid()
                )
            );

        CREATE POLICY "property_images_update_policy" ON property_images
            FOR UPDATE USING (
                auth.uid() = user_id
            );

        CREATE POLICY "property_images_delete_policy" ON property_images
            FOR DELETE USING (
                auth.uid() = user_id
            );

        RAISE NOTICE 'property_images table created with RLS policies';
    END IF;
END $$;

-- Add indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_property_images_objekt_id 
    ON property_images(objekt_id);

CREATE INDEX IF NOT EXISTS idx_property_images_user_id 
    ON property_images(user_id);

CREATE INDEX IF NOT EXISTS idx_property_images_primary 
    ON property_images(objekt_id, is_primary) 
    WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_property_images_display_order 
    ON property_images(objekt_id, display_order);

CREATE INDEX IF NOT EXISTS idx_property_images_floorplan 
    ON property_images(objekt_id, is_floorplan) 
    WHERE is_floorplan = true;

CREATE INDEX IF NOT EXISTS idx_property_images_objekt_order 
    ON property_images(objekt_id, display_order, is_primary DESC);

-- Add helpful comment
COMMENT ON TABLE property_images IS 'Stores images for objekt (properties). Safe migration that works in any environment.';