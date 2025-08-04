-- QUICK FIX FOR OBJEKT CREATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Step 1: Find your user ID (this will show your email and ID)
SELECT id, email, name FROM next_auth.users;

-- Step 2: Copy your ID from above and replace YOUR_USER_ID_HERE below
-- Also replace YOUR_EMAIL and YOUR_NAME with your actual values

INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'YOUR_USER_ID_HERE',     -- Example: '123e4567-e89b-12d3-a456-426614174000'
  'YOUR_EMAIL',            -- Example: 'john@example.com'
  'YOUR_NAME',             -- Example: 'John Doe'
  'maklare'                -- This gives you agent permissions
)
ON CONFLICT (id) DO NOTHING;  -- This prevents errors if you already exist

-- Step 3: Verify it worked
SELECT * FROM public.users WHERE email = 'YOUR_EMAIL';