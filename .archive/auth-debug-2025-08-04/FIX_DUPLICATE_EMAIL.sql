-- =====================================================
-- FIX FÖR DUPLICATE EMAIL ERROR
-- Löser: duplicate key value violates unique constraint "users_email_key"
-- =====================================================

-- Steg 1: Visa alla konflikter mellan auth.users och public.users
WITH email_conflicts AS (
  SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email,
    au.created_at as auth_created,
    pu.created_at as public_created
  FROM auth.users au
  FULL OUTER JOIN public.users pu ON au.email = pu.email
  WHERE au.id IS DISTINCT FROM pu.id
)
SELECT * FROM email_conflicts;

-- Steg 2: Visa specifikt anna.andersson problemet
SELECT 
  'auth.users' as table_name,
  id, 
  email, 
  created_at
FROM auth.users 
WHERE email = 'anna.andersson@maklarsystem.se'
UNION ALL
SELECT 
  'public.users' as table_name,
  id, 
  email, 
  created_at
FROM public.users 
WHERE email = 'anna.andersson@maklarsystem.se';

-- Steg 3: VÄLJ EN AV FÖLJANDE LÖSNINGAR:

-- ========= LÖSNING A: Ta bort dubblett från public.users =========
-- Använd detta om auth.users har rätt data
/*
DELETE FROM public.users 
WHERE email = 'anna.andersson@maklarsystem.se'
  AND id NOT IN (
    SELECT id FROM auth.users WHERE email = 'anna.andersson@maklarsystem.se'
  );
*/

-- ========= LÖSNING B: Uppdatera ID i public.users =========
-- Använd detta om du vill behålla data i public.users men synka ID:t
/*
UPDATE public.users pu
SET id = au.id
FROM auth.users au
WHERE pu.email = au.email
  AND pu.email = 'anna.andersson@maklarsystem.se';
*/

-- ========= LÖSNING C: Synkronisera med email-check =========
-- Säkrare version av synkroniseringsskriptet
INSERT INTO public.users (id, email, full_name, role, phone, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'maklare')::user_role,
  au.raw_user_meta_data->>'phone',
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  now()
FROM auth.users au
WHERE NOT EXISTS (
  -- Kontrollera både ID och email
  SELECT 1 FROM public.users pu 
  WHERE pu.id = au.id OR pu.email = au.email
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  updated_at = now();

-- ========= LÖSNING D: Rensa och börja om (FARLIGT!) =========
-- Använd ENDAST om du är säker på att auth.users har all rätt data
/*
-- VARNING: Detta tar bort ALL data från public.users!
TRUNCATE public.users CASCADE;

-- Synkronisera om från auth.users
INSERT INTO public.users (id, email, full_name, role, phone, avatar_url, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'maklare')::user_role,
  raw_user_meta_data->>'phone',
  raw_user_meta_data->>'avatar_url',
  created_at,
  now()
FROM auth.users;
*/

-- Steg 4: Uppdatera trigger-funktionen för att hantera email-konflikter bättre
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth, extensions
AS $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Kontrollera om email redan finns
  SELECT id INTO existing_user_id 
  FROM public.users 
  WHERE email = new.email 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL AND existing_user_id != new.id THEN
    -- Email finns men med annat ID - uppdatera ID:t
    UPDATE public.users 
    SET id = new.id,
        full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
        updated_at = now()
    WHERE email = new.email;
    
    RAISE NOTICE 'Updated user ID for email % from % to %', new.email, existing_user_id, new.id;
  ELSE
    -- Normal insert/update
    INSERT INTO public.users (
      id, email, full_name, role, phone, avatar_url, created_at, updated_at
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', new.email),
      COALESCE(new.raw_user_meta_data->>'role', 'maklare')::user_role,
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'avatar_url',
      COALESCE(new.created_at, now()),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      phone = COALESCE(EXCLUDED.phone, public.users.phone),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
      updated_at = now();
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Om vi fortfarande får unique violation, logga och fortsätt
    RAISE WARNING 'Unique violation for user %: %', new.email, SQLERRM;
    RETURN new;
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Återskapa triggern
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Steg 5: Visa slutresultat
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) - COUNT(DISTINCT email) as duplicate_emails
FROM public.users;

-- Visa eventuella kvarvarande problem
SELECT email, COUNT(*) as count
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;