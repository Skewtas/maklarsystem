-- Fix RLS policies for user registration
-- Run this in Supabase SQL Editor

-- First, check current RLS policies on public.users
SELECT 
    polname AS policy_name,
    polcmd AS command,
    polroles AS roles,
    polqual AS using_expression,
    polwithcheck AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Drop existing insert policy that might be blocking
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create a new insert policy that allows authenticated users to insert their own record
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also ensure the trigger function can bypass RLS
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;

-- Grant necessary permissions to the trigger function
GRANT INSERT ON public.users TO postgres;
GRANT INSERT ON public.users TO service_role;

-- Check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'users';

-- If RLS is not enabled, enable it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for the service role (used by triggers)
CREATE POLICY "Service role bypass"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Test the policies
SELECT * FROM pg_policies WHERE tablename = 'users';