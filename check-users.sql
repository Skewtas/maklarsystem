-- CHECK WHERE YOUR USERS ARE STORED

-- Option 1: Check if you have users in the auth.users table (Supabase Auth)
SELECT id, email, created_at 
FROM auth.users
LIMIT 10;

-- Option 2: Check if you have users in public.users table
SELECT id, email, full_name, role 
FROM public.users
LIMIT 10;

-- Option 3: Check all tables that might contain user data
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
AND table_schema NOT IN ('pg_catalog', 'information_schema');