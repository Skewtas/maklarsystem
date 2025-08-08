-- This script should be run in the Supabase SQL Editor
-- It will create or update the user rani.shakir@hotmail.com with a known password

-- First, delete any existing user with this email (if needed)
-- DELETE FROM auth.users WHERE email = 'rani.shakir@hotmail.com';

-- Create the user in auth.users with a specific password
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_sent_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'rani.shakir@hotmail.com',
  '$2b$10$BRpxkqHa7zho9Fw78huexuo/gF2Y8emY7OPNlbJs6Ay8g4dt7woAe', -- This is bcrypt hash for 'Welcome123!'
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Rani Shakir"}',
  false,
  'authenticated',
  'authenticated',
  now()
)
ON CONFLICT (email) 
DO UPDATE SET
  encrypted_password = '$2b$10$BRpxkqHa7zho9Fw78huexuo/gF2Y8emY7OPNlbJs6Ay8g4dt7woAe',
  email_confirmed_at = now(),
  updated_at = now();

-- Get the user ID
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the auth user id
  SELECT id INTO user_id FROM auth.users WHERE email = 'rani.shakir@hotmail.com';
  
  -- Create or update the corresponding entry in public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    user_id,
    'rani.shakir@hotmail.com',
    'Rani Shakir',
    'maklare'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
    
  RAISE NOTICE 'User created/updated successfully with ID: %', user_id;
END $$;

-- Verify the user was created
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.role as auth_role,
  pu.full_name,
  pu.role as public_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'rani.shakir@hotmail.com';

-- Password for login: Welcome123!