-- IMPORTANT: This script must be run in the Supabase SQL Editor or using the Supabase CLI
-- It requires service role permissions to create auth users

-- Step 1: Create the user in auth.users (Supabase authentication)
-- Note: You'll need to run this in Supabase Dashboard SQL Editor with service role
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  'rani.shakir@hotmail.com',
  crypt('password123', gen_salt('bf')), -- Change this password!
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Rani Shakir"}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Step 2: Get the user ID that was just created
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the auth user id
  SELECT id INTO user_id FROM auth.users WHERE email = 'rani.shakir@hotmail.com';
  
  -- Step 3: Create or update the corresponding entry in public.users
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
END $$;

-- Step 4: Verify the user was created correctly
SELECT 
  au.id,
  au.email as auth_email,
  au.email_confirmed_at,
  pu.email as public_email,
  pu.full_name,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'rani.shakir@hotmail.com';