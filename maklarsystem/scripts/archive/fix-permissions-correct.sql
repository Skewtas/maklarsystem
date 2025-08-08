-- Grant necessary permissions to the auth admin role
GRANT UPDATE ON auth.users TO supabase_auth_admin;
GRANT SELECT ON auth.users TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO supabase_auth_admin;

-- Verify permissions were granted
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