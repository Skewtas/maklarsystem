-- ============================================
-- Migration: Fix Missing SELECT Policies
-- Date: 2025-08-16
-- Description: Add missing SELECT policies for bud and visningar tables
-- ============================================

-- 1. Add missing SELECT policy for bud table
CREATE POLICY "bud_select_maklare" ON bud FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM objekt o 
            WHERE o.id = bud.objekt_id 
            AND (
                o.maklare_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM users u 
                    WHERE u.id = auth.uid() 
                    AND u.role IN ('admin', 'koordinator')
                )
            )
        )
    );

-- 2. Add missing SELECT policy for visningar table
CREATE POLICY "visn_select_maklare" ON visningar FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM objekt o 
            WHERE o.id = visningar.objekt_id 
            AND (
                o.maklare_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM users u 
                    WHERE u.id = auth.uid() 
                    AND u.role IN ('admin', 'koordinator')
                )
            )
        )
    );

-- 3. Add public SELECT policy for property listings (for website display)
CREATE POLICY "objekt_select_public_listings" ON objekt FOR SELECT 
    USING (status = 'till_salu')
    TO anon;

-- 4. Add public SELECT policy for showings of public listings
CREATE POLICY "visn_select_public" ON visningar FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM objekt o 
            WHERE o.id = visningar.objekt_id 
            AND o.status = 'till_salu'
        )
    )
    TO anon;

-- 5. Add missing SELECT policies for maklarsystem table
CREATE POLICY "maklar_select_all" ON maklarsystem FOR SELECT 
    USING (true); -- Allow all authenticated users to read