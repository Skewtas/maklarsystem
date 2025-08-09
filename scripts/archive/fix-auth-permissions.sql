-- Fix permissions for auth.users table to allow auth service to update user fields
-- This fixes the error: "error update user`s last_sign_in field: ERROR: permission denied for table users (SQLSTATE 42501)"

-- Grant necessary permissions to the auth admin role
GRANT UPDATE ON auth.users TO supabase_auth_admin;

-- Specifically grant permission to update metadata columns
GRANT UPDATE (
    last_sign_in_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    confirmation_sent_at,
    email_confirmed_at,
    phone_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    reauthentication_token,
    reauthentication_sent_at
) ON auth.users TO supabase_auth_admin;

-- Also ensure the auth service can read user data
GRANT SELECT ON auth.users TO supabase_auth_admin;

-- Grant permissions for the auth schema functions
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO supabase_auth_admin;

-- Verify the permissions are set correctly
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'users' 
    AND table_schema = 'auth' 
    AND grantee = 'supabase_auth_admin'
ORDER BY privilege_type;