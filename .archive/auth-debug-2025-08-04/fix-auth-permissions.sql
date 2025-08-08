-- Ge auth schema behörighet att skriva till public.users
GRANT ALL ON public.users TO auth;

-- Skapa trigger för att synkronisera auth.users med public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'maklare'),
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Skapa trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Återställ lösenordet för Rani
UPDATE auth.users 
SET 
    encrypted_password = extensions.crypt('Test123!', extensions.gen_salt('bf')),
    updated_at = now()
WHERE email = 'rani.shakir@hotmail.com';