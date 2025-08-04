-- Check if the trigger exists and has proper permissions
-- Run this in Supabase SQL Editor

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
    proname AS function_name,
    prosecdef AS security_definer,
    provolatile AS volatility
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Check permissions on public.users table
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- Test the function manually (to see if it works)
-- This will help debug if there's an issue with the function itself
SELECT public.handle_new_user();