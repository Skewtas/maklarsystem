-- KORREKT RLS Fix för objekt-tabellen
-- Kör denna i Supabase SQL Editor

-- 1. Kontrollera RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'objekt';

-- 2. Ta bort gamla policies om de finns
DROP POLICY IF EXISTS "Mäklare can create objekt" ON objekt;
DROP POLICY IF EXISTS "Users can insert their own objekt" ON objekt;
DROP POLICY IF EXISTS "Authenticated users can create objekt" ON objekt;
DROP POLICY IF EXISTS "Allow authenticated insert" ON objekt;
DROP POLICY IF EXISTS "Allow authenticated select" ON objekt;
DROP POLICY IF EXISTS "Allow authenticated update" ON objekt;

-- 3. Skapa nya enkla policies för authenticated users
CREATE POLICY "authenticated_insert" ON objekt
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_select" ON objekt
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "authenticated_update" ON objekt
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete" ON objekt
FOR DELETE TO authenticated
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email IN ('admin@maklarsystem.se', 'rani.shakir@matchahem.se')
));

-- 4. Verifiera att policies skapades
SELECT 
  polname as policy_name,
  polcmd as command
FROM pg_policy 
WHERE polrelid = 'objekt'::regclass;

-- 5. Testa med en enkel insert (använd rätt kolumnnamn!)
INSERT INTO objekt (
  adress,
  postnummer,
  ort,
  kommun,  -- REQUIRED field
  lan,      -- REQUIRED field
  typ,
  status,
  maklare_id
) VALUES (
  'Testgatan 999',
  '12345',
  'Teststad',
  'Stockholm',  -- kommun value
  'Stockholm',  -- lan value
  'villa',
  'kundbearbetning',
  '6d24c738-80b6-4716-8bb5-5fe025eb0f1f' -- Anna's ID (samma i båda tabellerna)
);

-- 6. Om det fungerade, ta bort testobjektet
DELETE FROM objekt WHERE adress = 'Testgatan 999';

-- 7. Visa alla kolumner i objekt-tabellen för referens
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'objekt'
ORDER BY ordinal_position;

-- 8. Visa bara REQUIRED kolumner (NOT NULL utan default)
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'objekt'
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY ordinal_position;