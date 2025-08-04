-- SÄKER FIX - Behåller befintliga relationer
-- Kör detta i Supabase SQL Editor

-- 1. Kontrollera Annas ID i båda tabellerna
SELECT 
  'auth.users' as table_name,
  id,
  email
FROM auth.users 
WHERE email = 'anna.andersson@maklarsystem.se'
UNION ALL
SELECT 
  'public.users' as table_name,
  id,
  email
FROM public.users 
WHERE email = 'anna.andersson@maklarsystem.se';

-- 2. Kontrollera om Anna har objekt
SELECT COUNT(*) as antal_objekt 
FROM objekt 
WHERE maklare_id = '6a0af328-9be6-4dd9-ae83-ce2cf512da6d';

-- 3. Uppdatera bara RLS policies (INTE användar-ID:n)
-- Ta bort gamla policies
DROP POLICY IF EXISTS "Users can insert their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can view their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can update their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can delete their own objects" ON objekt;

-- 4. Skapa nya policies som fungerar oavsett vilket ID Anna har
CREATE POLICY "Users can insert their own objects" ON objekt
FOR INSERT 
WITH CHECK (
  maklare_id IN (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

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

-- 5. Testa att auth.email() fungerar
-- OBS: Detta visar bara om du är inloggad i Supabase Dashboard
SELECT auth.email() as current_user_email;

-- 6. Testa att skapa ett objekt (fungerar bara om du är inloggad som Anna)
-- För att testa ordentligt, använd applikationen istället
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
  'Test från SQL - ' || NOW()::text,
  '12345',
  'Stockholm',
  'Stockholm',
  'Stockholm',
  'villa',
  'kundbearbetning',
  '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'  -- Annas befintliga ID i public.users
);

-- Ta bort testobjektet om det skapades
DELETE FROM objekt WHERE adress LIKE 'Test från SQL%';