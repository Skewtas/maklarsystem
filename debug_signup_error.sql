-- Debug signup error
-- Run each section separately in Supabase SQL Editor

-- 1. Check if the trigger exists
SELECT 
    tgname AS trigger_name,
    tgtype,
    tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 2. Check the trigger function
SELECT 
    proname AS function_name,
    prosrc AS function_source
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Test creating a user directly (to see the actual error)
-- This simulates what happens during signup
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- First, insert into auth.users (simulating what Supabase does)
    -- Note: This is just for testing, normally Supabase handles this
    
    -- Now test if our trigger would work
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        phone,
        created_at,
        updated_at
    )
    VALUES (
        test_user_id,
        'trigger-test@example.com',
        'Trigger Test User',
        'maklare',
        NULL,
        now(),
        now()
    );
    
    -- If successful, clean up
    DELETE FROM public.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Trigger function test successful!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing trigger: %', SQLERRM;
END $$;

-- 4. Check for any constraint violations
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 5. Check column definitions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;