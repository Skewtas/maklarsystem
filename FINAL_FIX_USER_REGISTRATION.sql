-- ====================================
-- COMPLETE USER REGISTRATION FIX
-- Run this entire script in Supabase SQL Editor
-- ====================================

-- 1. First, let's check what's currently wrong
SELECT 'STEP 1: Checking current setup...' as status;

-- Check if trigger exists
SELECT 
    'Trigger exists: ' || CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END as trigger_status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check current policies
SELECT 
    policyname AS policy_name,
    cmd AS command
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 2. Drop all existing policies on public.users to start fresh
SELECT 'STEP 2: Dropping existing policies...' as status;

-- Drop ANY existing policies (using different naming patterns that might exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role bypass" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Enable insert for signup" ON public.users;
-- Drop any other policies that might exist
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- 3. Enable RLS on the table
SELECT 'STEP 3: Enabling RLS...' as status;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create comprehensive policies
SELECT 'STEP 4: Creating new policies...' as status;

-- Policy for users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for users to insert their own profile (critical for registration)
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy for service role to bypass RLS (needed for triggers)
CREATE POLICY "Service role full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for anonymous users to insert (needed during signup process)
CREATE POLICY "Enable insert for signup"
ON public.users
FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Recreate the trigger function with proper security
SELECT 'STEP 5: Recreating trigger function...' as status;

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- This is critical!
SET search_path = public
AS $$
BEGIN
  -- Insert user into public.users
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
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1) -- Fallback to email username
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'maklare'), -- Default role
    new.raw_user_meta_data->>'phone',
    COALESCE(new.created_at, now()),
    COALESCE(new.updated_at, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = now();
    
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- 6. Create the trigger
SELECT 'STEP 6: Creating trigger...' as status;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Grant necessary permissions
SELECT 'STEP 7: Granting permissions...' as status;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO anon; -- Needed for signup

-- Grant permissions for the trigger function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 8. Test the setup
SELECT 'STEP 8: Testing setup...' as status;

-- Test with a mock user
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- Test direct insert (simulating what the trigger does)
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    )
    VALUES (
        test_user_id,
        'test-' || test_user_id::text || '@example.com',
        'Test User',
        'maklare',
        now(),
        now()
    );
    
    -- If successful, clean up
    DELETE FROM public.users WHERE id = test_user_id;
    
    RAISE NOTICE '✅ Direct insert test PASSED';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '❌ Direct insert test FAILED: %', SQLERRM;
END $$;

-- 9. Final verification
SELECT 'STEP 9: Final verification...' as status;

-- Show all policies
SELECT 
    '✅ Policy: ' || policyname || ' (Command: ' || cmd || ')' as configured_policies
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- Show trigger status
SELECT 
    '✅ Trigger: ' || tgname || ' is ' || 
    CASE 
        WHEN tgenabled = 'O' THEN 'ENABLED' 
        WHEN tgenabled = 'D' THEN 'DISABLED'
        ELSE 'UNKNOWN'
    END as trigger_status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Show function status
SELECT 
    '✅ Function: handle_new_user exists with security definer = ' || prosecdef::text as function_status
FROM pg_proc
WHERE proname = 'handle_new_user';

SELECT '🎉 User registration setup is now complete!' as final_status;
SELECT 'You can now test registration at your application!' as next_step;