-- Enkel fix för RLS problemet
-- Kör detta i Supabase SQL Editor

-- 1. Ta bort gamla policies
DROP POLICY IF EXISTS "Users can insert their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can view their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can update their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can delete their own objects" ON objekt;

-- 2. Skapa nya policies som fungerar med vår user-struktur
-- INSERT policy
CREATE POLICY "Users can insert their own objects" ON objekt
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = objekt.maklare_id
    AND users.email = auth.email()
  )
);

-- SELECT policy
CREATE POLICY "Users can view their own objects" ON objekt
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = objekt.maklare_id
    AND users.email = auth.email()
  )
);

-- UPDATE policy
CREATE POLICY "Users can update their own objects" ON objekt
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = objekt.maklare_id
    AND users.email = auth.email()
  )
);

-- DELETE policy
CREATE POLICY "Users can delete their own objects" ON objekt
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = objekt.maklare_id
    AND users.email = auth.email()
  )
);

-- 3. Verifiera att Anna finns i public.users
SELECT id, email, full_name FROM public.users 
WHERE email = 'anna.andersson@maklarsystem.se';

-- 4. Testa att skapa ett objekt (detta bör fungera nu)
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
  'RLS Test - Bör fungera nu',
  '12345',
  'Stockholm',
  'Stockholm',
  'Stockholm',
  'villa',
  'kundbearbetning',
  '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'  -- Annas public.users ID
);

-- 5. Om det fungerade, ta bort testobjektet
DELETE FROM objekt WHERE adress = 'RLS Test - Bör fungera nu';