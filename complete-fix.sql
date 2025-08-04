-- KOMPLETT FIX FÖR OBJEKTSKAPANDE
-- Kör detta i Supabase SQL Editor

-- 1. Kontrollera att Anna finns i auth.users
SELECT id, email FROM auth.users WHERE email = 'anna.andersson@maklarsystem.se';

-- 2. Om Anna inte finns i public.users, lägg till henne
-- OBS: Använd ID från auth.users ovan!
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'anna.andersson@maklarsystem.se'),
  'anna.andersson@maklarsystem.se',
  'Anna Andersson',
  'maklare'
)
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 3. Verifiera att Anna nu finns i båda tabellerna
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

-- 4. Skapa fungerande RLS policies
-- Ta bort gamla policies först
DROP POLICY IF EXISTS "Users can insert their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can view their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can update their own objects" ON objekt;
DROP POLICY IF EXISTS "Users can delete their own objects" ON objekt;

-- Skapa nya policies som matchar vår struktur
CREATE POLICY "Users can insert their own objects" ON objekt
FOR INSERT 
WITH CHECK (
  maklare_id = (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Users can view their own objects" ON objekt
FOR SELECT 
USING (
  maklare_id = (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Users can update their own objects" ON objekt
FOR UPDATE 
USING (
  maklare_id = (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Users can delete their own objects" ON objekt
FOR DELETE 
USING (
  maklare_id = (
    SELECT id FROM public.users 
    WHERE email = auth.email()
  )
);

-- 5. Skapa en trigger för automatisk synkronisering
CREATE OR REPLACE FUNCTION sync_users_on_auth_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'maklare'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ta bort gammal trigger om den finns
DROP TRIGGER IF EXISTS sync_users_on_auth_change ON auth.users;

-- Skapa ny trigger
CREATE TRIGGER sync_users_on_auth_change
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_users_on_auth_insert();

-- 6. Synka alla befintliga användare
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'maklare'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- 7. Verifiera att allt fungerar
-- Lista alla användare
SELECT * FROM public.users;

-- Testa att skapa ett objekt som Anna
-- OBS: Detta fungerar bara om du är inloggad som Anna i Supabase Dashboard
-- För att testa, använd applikationen istället