-- VIKTIGT: Kör detta direkt i Supabase Dashboard SQL Editor
-- Detta script skapar en enkel autentiseringslösning tills Auth API fungerar

-- 1. Först, skapa en temporär inloggningsfunktion
CREATE OR REPLACE FUNCTION public.temp_login(
  p_email text,
  p_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_data json;
BEGIN
  -- För demo/test - godkänn specifika användare
  IF p_email = 'test@maklarsystem.se' AND p_password = 'Test123!' THEN
    -- Skapa eller hämta användare
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      gen_random_uuid(),
      'test@maklarsystem.se',
      'Test Användare',
      'maklare'
    )
    ON CONFLICT (email) DO UPDATE
    SET updated_at = now()
    RETURNING id INTO v_user_id;
    
    -- Returnera användardata
    SELECT json_build_object(
      'id', id,
      'email', email,
      'full_name', full_name,
      'role', role
    ) INTO v_user_data
    FROM public.users
    WHERE id = v_user_id;
    
    RETURN v_user_data;
  ELSE
    RAISE EXCEPTION 'Invalid credentials';
  END IF;
END;
$$;

-- 2. Skapa en session-tabell för att hantera inloggningar
CREATE TABLE IF NOT EXISTS public.temp_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '7 days'
);

-- 3. Skapa en funktion för att skapa sessioner
CREATE OR REPLACE FUNCTION public.create_temp_session(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
  v_session_data json;
BEGIN
  -- Generera token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Skapa session
  INSERT INTO public.temp_sessions (user_id, token)
  VALUES (p_user_id, v_token);
  
  -- Returnera session data
  SELECT json_build_object(
    'token', v_token,
    'user', json_build_object(
      'id', u.id,
      'email', u.email,
      'full_name', u.full_name,
      'role', u.role
    )
  ) INTO v_session_data
  FROM public.users u
  WHERE u.id = p_user_id;
  
  RETURN v_session_data;
END;
$$;

-- 4. Skapa en funktion för att verifiera sessioner
CREATE OR REPLACE FUNCTION public.verify_temp_session(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_data json;
BEGIN
  -- Hämta användardata från giltig session
  SELECT json_build_object(
    'id', u.id,
    'email', u.email,
    'full_name', u.full_name,
    'role', u.role
  ) INTO v_user_data
  FROM public.temp_sessions s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.token = p_token
  AND s.expires_at > now();
  
  IF v_user_data IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired session';
  END IF;
  
  RETURN v_user_data;
END;
$$;

-- 5. Lägg till test-användare direkt
INSERT INTO public.users (id, email, full_name, role)
VALUES 
  (gen_random_uuid(), 'test@maklarsystem.se', 'Test Användare', 'maklare'),
  (gen_random_uuid(), 'demo@maklarsystem.se', 'Demo Användare', 'maklare')
ON CONFLICT (email) DO NOTHING;

-- 6. Visa befintliga användare
SELECT id, email, full_name, role, created_at 
FROM public.users 
ORDER BY created_at DESC;