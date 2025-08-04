-- Kontrollera RLS policies för objekt tabellen
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objekt'
ORDER BY policyname;

-- Kontrollera om RLS är aktiverat
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objekt';

-- Testa om vi kan skapa objekt utan RLS
-- OBS: Kör detta endast för test!
ALTER TABLE objekt DISABLE ROW LEVEL SECURITY;

-- Testa insert
INSERT INTO objekt (
  adress,
  postnummer,
  ort,
  kommun,
  lan,
  typ,
  status,
  maklare_id
) VALUES (
  'RLS Test',
  '12345',
  'Stockholm',
  'Stockholm',
  'Stockholm',
  'villa',
  'kundbearbetning',
  '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'
);

-- Kontrollera om det fungerade
SELECT id, adress, maklare_id FROM objekt WHERE adress = 'RLS Test';

-- Ta bort testobjektet
DELETE FROM objekt WHERE adress = 'RLS Test';

-- VIKTIGT: Aktivera RLS igen!
ALTER TABLE objekt ENABLE ROW LEVEL SECURITY;

-- Skapa en fungerande RLS policy för INSERT
DROP POLICY IF EXISTS "Users can insert their own objects" ON objekt;

CREATE POLICY "Users can insert their own objects" ON objekt
FOR INSERT 
WITH CHECK (
  maklare_id IN (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

-- Skapa även policies för SELECT, UPDATE och DELETE
DROP POLICY IF EXISTS "Users can view their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can update their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can delete their own objects" ON objekt;

CREATE POLICY "Users can view their own objects" ON objekt
FOR SELECT 
USING (
  maklare_id IN (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Users can update their own objects" ON objekt
FOR UPDATE 
USING (
  maklare_id IN (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Users can delete their own objects" ON objekt
FOR DELETE 
USING (
  maklare_id IN (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

-- Testa om RLS fungerar nu
INSERT INTO objekt (
  adress,
  postnummer,
  ort,
  kommun,
  lan,
  typ,
  status,
  maklare_id
) VALUES (
  'RLS Policy Test',
  '12345',
  'Stockholm',
  'Stockholm',
  'Stockholm',
  'villa',
  'kundbearbetning',
  '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'
);

-- Om det fungerade, ta bort testobjektet
DELETE FROM objekt WHERE adress = 'RLS Policy Test';