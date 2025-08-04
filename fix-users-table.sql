-- Fixa users-tabellen så att Anna finns där

-- 1. Kontrollera om Anna finns i public.users
SELECT * FROM public.users WHERE email = 'anna.andersson@maklarsystem.se';

-- 2. Om hon inte finns, lägg till henne
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  '6d24c738-80b6-4716-8bb5-5fe025eb0f1f',  -- Samma ID som i auth.users
  'anna.andersson@maklarsystem.se',
  'Anna Andersson',
  'maklare'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 3. Verifiera att hon nu finns
SELECT * FROM public.users WHERE id = '6d24c738-80b6-4716-8bb5-5fe025eb0f1f';

-- 4. Nu kan vi testa INSERT i objekt igen
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
  'Testgatan 999',
  '12345',
  'Teststad',
  'Stockholm',
  'Stockholm',
  'villa',
  'kundbearbetning',
  '6d24c738-80b6-4716-8bb5-5fe025eb0f1f'
);

-- 5. Om det fungerade, ta bort testobjektet
DELETE FROM objekt WHERE adress = 'Testgatan 999';

-- 6. Skapa en permanent synkronisering mellan auth.users och public.users
-- Detta säkerställer att alla nya användare automatiskt läggs till i public.users
CREATE OR REPLACE FUNCTION sync_auth_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'maklare'  -- Default role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Skapa trigger på auth.users
CREATE TRIGGER sync_users_on_auth_change
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_auth_to_public_users();

-- 7. Synka alla befintliga användare
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