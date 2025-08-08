# Plan för att lösa Autentiseringsproblemet i Supabase

## Problem
- **Fel**: "permission denied for table users (SQLSTATE 42501)"
- **Orsak**: auth schema (supabase_auth_admin rollen) saknar behörighet att skriva till public.users tabellen
- **Påverkan**: Nya användare kan inte registrera sig eller logga in

## Rotorsak
När en trigger på auth.users tabellen körs, använder den `supabase_auth_admin` rollen som är begränsad till auth schema. Detta är en säkerhetsfunktion i Supabase.

## Lösning: SECURITY DEFINER

### Steg 1: Logga in på Supabase Dashboard
1. Gå till https://supabase.com/dashboard
2. Logga in med dina credentials
3. Välj ditt projekt (maklarsystem)

### Steg 2: Öppna SQL Editor
1. I sidomenyn, klicka på "SQL Editor" ikonen
2. Klicka på "New query" för att skapa en ny SQL-fråga

### Steg 3: Kör följande SQL-script

```sql
-- Steg 1: Ta bort befintlig trigger och funktion om de finns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Steg 2: Skapa trigger-funktionen med SECURITY DEFINER och search_path
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Sätt in eller uppdatera användare i public.users
  INSERT INTO public.users (id, email, full_name, role, phone, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'maklare'),
    new.raw_user_meta_data->>'phone',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = now();
  
  RETURN new;
END;
$$;

-- Steg 3: Skapa triggern
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Steg 4: Ge extra behörigheter (som backup)
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Steg 5: Synkronisera befintliga användare (om det finns några)
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'maklare'),
  created_at,
  updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Steg 6: Återställ Ranis lösenord
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'rani.shakir@hotmail.com';
```

### Steg 4: Verifiera att scriptet kördes utan fel
1. Kontrollera att det står "Success. No rows returned" eller liknande
2. Om det finns fel, läs felmeddelandet noga

### Steg 5: Testa autentiseringen

#### Option A: Testa via Supabase Dashboard
1. Gå till Authentication > Users
2. Hitta rani.shakir@hotmail.com
3. Klicka på "Send recovery email" eller "Reset password"
4. Sätt lösenordet till: Test123!

#### Option B: Testa via applikationen
```bash
cd /Users/ranishakir/Maklarsystem/maklarsystem
npm run dev
```
1. Gå till http://localhost:3000/login
2. Logga in med:
   - Email: rani.shakir@hotmail.com
   - Password: Test123!

### Steg 6: Verifiera att synkroniseringen fungerar
Kör följande SQL i Supabase Dashboard för att kontrollera:

```sql
-- Kontrollera att användaren finns i båda tabellerna
SELECT 
  'auth.users' as table_name,
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'rani.shakir@hotmail.com'

UNION ALL

SELECT 
  'public.users' as table_name,
  id, 
  email, 
  NULL as email_confirmed_at,
  created_at
FROM public.users 
WHERE email = 'rani.shakir@hotmail.com';
```

## Felsökning

### Om inloggning fortfarande inte fungerar:

1. **Kontrollera RLS policies**:
```sql
-- Lista alla policies på users tabellen
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. **Verifiera att triggern skapades**:
```sql
-- Lista alla triggers på auth.users
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
```

3. **Testa manuell insert**:
```sql
-- Testa om service_role kan skriva till public.users
SET ROLE service_role;
INSERT INTO public.users (id, email, full_name) 
VALUES (gen_random_uuid(), 'test@example.com', 'Test User')
ON CONFLICT DO NOTHING;
RESET ROLE;
```

## Alternativ lösning om SECURITY DEFINER inte fungerar

Om ovanstående inte fungerar, kan du temporärt ge direkta behörigheter:

```sql
-- GE INTE DESSA BEHÖRIGHETER I PRODUKTION!
-- Detta är endast för felsökning
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
```

## Nästa steg efter lösningen

1. Testa att skapa en ny användare via registreringsflödet
2. Verifiera att användaren skapas i både auth.users och public.users
3. Testa inloggning med den nya användaren
4. Dokumentera lösningen i projektets README

## Säkerhetsnoteringar

- SECURITY DEFINER gör att funktionen körs med skaparens behörigheter (postgres)
- `SET search_path = ''` förhindrar SQL injection via search path manipulation
- Ge aldrig supabase_auth_admin fulla behörigheter i produktion
- Använd alltid RLS policies för att begränsa åtkomst på radnivå