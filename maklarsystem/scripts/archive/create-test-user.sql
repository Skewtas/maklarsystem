-- Create test user for authentication testing
-- Run this in Supabase SQL Editor

-- Step 1: Create or update the user in auth.users
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
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  '$2b$10$BRpxkqHa7zho9Fw78huexuo/gF2Y8emY7OPNlbJs6Ay8g4dt7woAe', -- Password: Welcome123!
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',
  false,
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) 
DO UPDATE SET
  encrypted_password = '$2b$10$BRpxkqHa7zho9Fw78huexuo/gF2Y8emY7OPNlbJs6Ay8g4dt7woAe',
  email_confirmed_at = now(),
  updated_at = now();

-- Step 2: Create or update in public.users
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the auth user id
  SELECT id INTO user_id FROM auth.users WHERE email = 'test@example.com';
  
  -- Create or update the corresponding entry in public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    user_id,
    'test@example.com',
    'Test User',
    'maklare'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
    
  RAISE NOTICE 'User created/updated successfully with ID: %', user_id;
END $$;

-- Step 3: Verify the user was created
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.role as auth_role,
  pu.full_name,
  pu.role as public_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'test@example.com';

-- Login credentials:
-- Email: test@example.com
-- Password: Welcome123!