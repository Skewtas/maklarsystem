-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view kontakter" ON kontakter;
DROP POLICY IF EXISTS "Authenticated users can create kontakter" ON kontakter;
DROP POLICY IF EXISTS "Authenticated users can update kontakter" ON kontakter;
DROP POLICY IF EXISTS "Authenticated users can view objekt" ON objekt;
DROP POLICY IF EXISTS "Mäklare can create objekt" ON objekt;
DROP POLICY IF EXISTS "Mäklare can update own objekt" ON objekt;

-- Create optimized RLS policies

-- Users policies with security definer function for better performance
CREATE OR REPLACE FUNCTION auth.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM users WHERE id = (SELECT auth.uid())
$$;

-- Users table policies
CREATE POLICY "users_select_policy" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_update_own_policy" ON users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "users_admin_update_policy" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Kontakter table policies with role-based access
CREATE POLICY "kontakter_select_policy" ON kontakter
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "kontakter_insert_policy" ON kontakter
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'maklare', 'koordinator')
    )
  );

CREATE POLICY "kontakter_update_policy" ON kontakter
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'maklare', 'koordinator')
    )
  );

CREATE POLICY "kontakter_delete_policy" ON kontakter
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'maklare')
    )
  );

-- Objekt table policies with ownership and role-based access
CREATE POLICY "objekt_select_policy" ON objekt
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "objekt_insert_policy" ON objekt
  FOR INSERT TO authenticated
  WITH CHECK (
    maklare_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

CREATE POLICY "objekt_update_own_policy" ON objekt
  FOR UPDATE TO authenticated
  USING (
    maklare_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

CREATE POLICY "objekt_delete_policy" ON objekt
  FOR DELETE TO authenticated
  USING (
    maklare_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Visningar table policies (inherit from objekt)
CREATE POLICY "visningar_select_policy" ON visningar
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM objekt 
      WHERE id = objekt_id 
      AND (
        maklare_id = (SELECT auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = (SELECT auth.uid()) 
          AND role IN ('admin', 'koordinator')
        )
      )
    )
  );

CREATE POLICY "visningar_insert_policy" ON visningar
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM objekt 
      WHERE id = objekt_id 
      AND (
        maklare_id = (SELECT auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = (SELECT auth.uid()) 
          AND role IN ('admin', 'koordinator')
        )
      )
    )
  );

CREATE POLICY "visningar_update_policy" ON visningar
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM objekt 
      WHERE id = objekt_id 
      AND (
        maklare_id = (SELECT auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = (SELECT auth.uid()) 
          AND role IN ('admin', 'koordinator')
        )
      )
    )
  );

-- Bud table policies (inherit from objekt)
CREATE POLICY "bud_select_policy" ON bud
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM objekt 
      WHERE id = objekt_id 
      AND (
        maklare_id = (SELECT auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = (SELECT auth.uid()) 
          AND role IN ('admin', 'koordinator')
        )
      )
    )
  );

CREATE POLICY "bud_insert_policy" ON bud
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM objekt 
      WHERE id = objekt_id 
      AND (
        maklare_id = (SELECT auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = (SELECT auth.uid()) 
          AND role IN ('admin', 'koordinator')
        )
      )
    )
  );

-- Kalenderhändelser table policies (user-specific)
CREATE POLICY "kalenderhändelser_select_policy" ON kalenderhändelser
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

CREATE POLICY "kalenderhändelser_insert_policy" ON kalenderhändelser
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

CREATE POLICY "kalenderhändelser_update_policy" ON kalenderhändelser
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

-- Uppgifter table policies (assignment-based)
CREATE POLICY "uppgifter_select_policy" ON uppgifter
  FOR SELECT TO authenticated
  USING (
    skapad_av = (SELECT auth.uid()) OR
    tilldelad_till = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

CREATE POLICY "uppgifter_insert_policy" ON uppgifter
  FOR INSERT TO authenticated
  WITH CHECK (
    skapad_av = (SELECT auth.uid())
  );

CREATE POLICY "uppgifter_update_policy" ON uppgifter
  FOR UPDATE TO authenticated
  USING (
    skapad_av = (SELECT auth.uid()) OR
    tilldelad_till = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'koordinator')
    )
  );

-- Notifikationer table policies (user-specific)
CREATE POLICY "notifikationer_select_policy" ON notifikationer
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "notifikationer_insert_policy" ON notifikationer
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "notifikationer_update_policy" ON notifikationer
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Add indexes for RLS performance optimization
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(id) WHERE id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_objekt_maklare_rls ON objekt(maklare_id) WHERE maklare_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kalenderhändelser_user_rls ON kalenderhändelser(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uppgifter_assignments ON uppgifter(skapad_av, tilldelad_till);
CREATE INDEX IF NOT EXISTS idx_notifikationer_user_rls ON notifikationer(user_id) WHERE user_id IS NOT NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 