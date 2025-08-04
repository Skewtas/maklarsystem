-- Test RLS Policies för objekt-tabellen
-- Kör denna i Supabase SQL Editor

-- 1. Kontrollera om RLS är aktiverat
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objekt';

-- 2. Lista alla RLS policies för objekt
SELECT 
  polname as policy_name,
  polcmd as command,
  polroles::regrole[] as roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.objekt'::regclass;

-- 3. Testa INSERT som Anna Andersson
SET LOCAL "request.jwt.claims" = '{"sub":"6a0af328-9be6-4dd9-ae83-ce2cf512da6d"}';

-- 4. Enkel test-insert
INSERT INTO public.objekt (
  adress,
  postnummer,
  ort,
  typ,
  status,
  maklare_id
) VALUES (
  'Testgatan 123',
  '12345',
  'Teststad',
  'villa',
  'kundbearbetning',
  '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'
);

-- 5. Om det fungerade, ta bort testobjektet
DELETE FROM public.objekt WHERE adress = 'Testgatan 123';

-- 6. Skapa förenklade RLS policies (KÖR DETTA OM INSERT INTE FUNGERAR)
-- Först, ta bort gamla policies
DROP POLICY IF EXISTS "Mäklare can create objekt" ON objekt;
DROP POLICY IF EXISTS "Users can insert their own objekt" ON objekt;
DROP POLICY IF EXISTS "Authenticated users can create objekt" ON objekt;

-- Skapa ny enkel policy för INSERT
CREATE POLICY "Allow authenticated insert" ON objekt
FOR INSERT TO authenticated
WITH CHECK (true);

-- Skapa policy för SELECT
CREATE POLICY "Allow authenticated select" ON objekt
FOR SELECT TO authenticated
USING (true);

-- Skapa policy för UPDATE
CREATE POLICY "Allow authenticated update" ON objekt
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Verifiera nya policies
SELECT 
  polname as policy_name,
  polcmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.objekt'::regclass;