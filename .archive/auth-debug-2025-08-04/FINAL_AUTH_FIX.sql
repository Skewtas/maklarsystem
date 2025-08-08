-- =====================================================
-- FINAL AUTH FIX FOR SUPABASE
-- Detta script löser "permission denied for table users"
-- =====================================================

-- Steg 1: Ta bort befintliga triggers och funktioner för ren start
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Steg 2: Skapa den nya trigger-funktionen med SECURITY DEFINER
-- SECURITY DEFINER gör att funktionen körs med postgres-behörigheter
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- Logga för debugging (kan tas bort senare)
  RAISE NOTICE 'handle_new_user triggered for user %', new.email;
  
  -- Sätt in eller uppdatera användare i public.users
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    phone, 
    avatar_url,
    created_at, 
    updated_at
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
    updated_at = now()
  WHERE public.users.email IS DISTINCT FROM EXCLUDED.email
     OR public.users.full_name IS DISTINCT FROM EXCLUDED.full_name
     OR public.users.phone IS DISTINCT FROM EXCLUDED.phone
     OR public.users.avatar_url IS DISTINCT FROM EXCLUDED.avatar_url;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Logga fel men låt inte det stoppa auth-flödet
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Steg 3: Skapa triggern för både INSERT och UPDATE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Steg 4: Säkerställ att rätt behörigheter finns
-- Dessa är standard Supabase-roller som behöver åtkomst
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO postgres;

-- Steg 5: Skapa RLS policies om de inte finns
-- Användare kan bara se och uppdatera sin egen data
DO $$ 
BEGIN
  -- Enable RLS om det inte redan är aktiverat
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  
  -- Ta bort gamla policies om de finns
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
  DROP POLICY IF EXISTS "Service role has full access" ON public.users;
  
  -- Skapa nya policies
  CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);
  
  CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);
  
  CREATE POLICY "Service role has full access" 
    ON public.users FOR ALL 
    USING (auth.role() = 'service_role');
END $$;

-- Steg 6: Synkronisera alla befintliga auth.users till public.users
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
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Steg 7: Uppdatera befintliga användare som kanske har gammal data
UPDATE public.users pu
SET 
  email = au.email,
  full_name = COALESCE(au.raw_user_meta_data->>'full_name', pu.full_name),
  updated_at = now()
FROM auth.users au
WHERE pu.id = au.id 
  AND (pu.email != au.email OR pu.full_name IS NULL);

-- Steg 8: Återställ Ranis lösenord och säkerställ att kontot är aktiverat
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token = NULL,
  recovery_token = NULL,
  email_change_token_new = NULL,
  email_change = NULL,
  updated_at = now()
WHERE email = 'rani.shakir@hotmail.com';

-- Steg 9: Verifiera att allt fungerar
DO $$
DECLARE
  v_auth_count INTEGER;
  v_public_count INTEGER;
  v_rani_auth BOOLEAN;
  v_rani_public BOOLEAN;
BEGIN
  -- Räkna användare i båda tabellerna
  SELECT COUNT(*) INTO v_auth_count FROM auth.users;
  SELECT COUNT(*) INTO v_public_count FROM public.users;
  
  -- Kontrollera att Rani finns i båda
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'rani.shakir@hotmail.com') INTO v_rani_auth;
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'rani.shakir@hotmail.com') INTO v_rani_public;
  
  -- Rapportera status
  RAISE NOTICE '=== VERIFIERING ===';
  RAISE NOTICE 'Användare i auth.users: %', v_auth_count;
  RAISE NOTICE 'Användare i public.users: %', v_public_count;
  RAISE NOTICE 'Rani i auth.users: %', v_rani_auth;
  RAISE NOTICE 'Rani i public.users: %', v_rani_public;
  
  IF v_auth_count != v_public_count THEN
    RAISE WARNING 'OBS! Olika antal användare i auth och public tabellerna!';
  END IF;
  
  IF NOT v_rani_auth OR NOT v_rani_public THEN
    RAISE WARNING 'OBS! Rani saknas i en av tabellerna!';
  ELSE
    RAISE NOTICE 'SUCCESS! Rani finns i båda tabellerna.';
  END IF;
END $$;

-- Visa slutresultat
SELECT 
  'auth.users' as table_name,
  id, 
  email, 
  CASE WHEN email_confirmed_at IS NOT NULL THEN 'Ja' ELSE 'Nej' END as email_bekräftad,
  created_at::date as skapad
FROM auth.users 
WHERE email = 'rani.shakir@hotmail.com'

UNION ALL

SELECT 
  'public.users' as table_name,
  id, 
  email, 
  full_name as email_bekräftad,
  created_at::date as skapad
FROM public.users 
WHERE email = 'rani.shakir@hotmail.com';

-- =====================================================
-- KLART! Du bör nu kunna logga in med:
-- Email: rani.shakir@hotmail.com
-- Lösenord: Test123!
-- =====================================================