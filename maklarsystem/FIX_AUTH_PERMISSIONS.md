# Fix Supabase Auth Permissions Issue

## Problem
The login is failing with error: "error update user`s last_sign_in field: ERROR: permission denied for table users (SQLSTATE 42501)"

This happens because the supabase_auth_admin role doesn't have proper permissions to update the auth.users table.

## Solution

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/exreuewsrgavzsbdnghv/editor

2. Run this SQL in the SQL Editor:

```sql
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
```

3. After running the SQL, test login with:
   - Email: rani.shakir@hotmail.com
   - Password: 69179688AA

## Root Cause
This is a known issue with Supabase where the default permissions for the auth service are insufficient. The auth service needs to update fields like `last_sign_in_at` but doesn't have the necessary permissions by default.

## Verification
After applying the fix, the login should work properly and you should be redirected to the dashboard.