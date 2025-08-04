-- =====================================================
-- RLS Policy Check and Fix for objekt table
-- =====================================================

-- 1. Check current RLS status on objekt table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'objekt';

-- 2. List all existing policies on objekt table
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression,
    rol.rolname as role_name
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
LEFT JOIN pg_roles rol ON pol.polroles @> ARRAY[rol.oid]
WHERE nsp.nspname = 'public' 
AND cls.relname = 'objekt'
ORDER BY pol.polname;

-- 3. Check constraints on objekt table
SELECT 
    con.conname as constraint_name,
    con.contype as constraint_type,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class cls ON con.conrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public' 
AND cls.relname = 'objekt'
ORDER BY con.conname;

-- 4. Check triggers on objekt table
SELECT 
    trg.tgname as trigger_name,
    trg.tgtype as trigger_type,
    trg.tgenabled as enabled,
    pro.proname as function_name
FROM pg_trigger trg
JOIN pg_class cls ON trg.tgrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
JOIN pg_proc pro ON trg.tgfoid = pro.oid
WHERE nsp.nspname = 'public' 
AND cls.relname = 'objekt'
AND trg.tgisinternal = false
ORDER BY trg.tgname;

-- 5. Test current user permissions
DO $$
DECLARE
    current_user_id uuid;
    current_user_email text;
    current_user_role text;
BEGIN
    -- Get current user info from auth
    current_user_id := auth.uid();
    current_user_email := auth.jwt() ->> 'email';
    
    RAISE NOTICE 'Current auth.uid(): %', current_user_id;
    RAISE NOTICE 'Current email: %', current_user_email;
    
    -- Check if user exists in users table
    SELECT role INTO current_user_role
    FROM public.users
    WHERE id = current_user_id;
    
    RAISE NOTICE 'User role in users table: %', current_user_role;
    
    -- Test if Anna Andersson can be found
    PERFORM * FROM public.users WHERE email = 'anna.andersson@example.com';
    IF FOUND THEN
        RAISE NOTICE 'Anna Andersson found in users table';
    ELSE
        RAISE NOTICE 'Anna Andersson NOT found in users table';
    END IF;
END $$;

-- 6. Drop existing problematic policies
DROP POLICY IF EXISTS "Enable all access for admin users" ON public.objekt;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.objekt;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.objekt;
DROP POLICY IF EXISTS "Enable update for users who created the record" ON public.objekt;
DROP POLICY IF EXISTS "Enable delete for admin users only" ON public.objekt;

-- 7. Create new simplified RLS policies that work with current auth
-- Enable RLS
ALTER TABLE public.objekt ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (all authenticated users can read)
CREATE POLICY "objekt_select_policy" ON public.objekt
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for INSERT (all authenticated users can insert)
CREATE POLICY "objekt_insert_policy" ON public.objekt
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for UPDATE (all authenticated users can update)
CREATE POLICY "objekt_update_policy" ON public.objekt
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for DELETE (admin users only)
CREATE POLICY "objekt_delete_policy" ON public.objekt
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 8. Test INSERT permission with sample data
DO $$
DECLARE
    test_uuid uuid := gen_random_uuid();
BEGIN
    -- Try to insert a test record
    BEGIN
        INSERT INTO public.objekt (
            id,
            adress,
            postnummer,
            ort,
            status,
            skapat_datum,
            uppdaterat_datum
        ) VALUES (
            test_uuid,
            'Test Address 123',
            '12345',
            'Test City',
            'aktiv',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Test INSERT successful with id: %', test_uuid;
        
        -- Clean up test record
        DELETE FROM public.objekt WHERE id = test_uuid;
        RAISE NOTICE 'Test record cleaned up';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Test INSERT failed: %', SQLERRM;
    END;
END $$;

-- 9. Grant necessary permissions to authenticated role
GRANT ALL ON public.objekt TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 10. Check if there are any blocking constraints or defaults
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'objekt'
ORDER BY ordinal_position;

-- 11. Final verification - list active policies
SELECT 
    'After fix:' as status,
    pol.polname as policy_name,
    pol.polcmd as command,
    CASE 
        WHEN pg_get_expr(pol.polqual, pol.polrelid) IS NULL THEN 'true (allows all)'
        ELSE pg_get_expr(pol.polqual, pol.polrelid)
    END as using_expression,
    CASE 
        WHEN pg_get_expr(pol.polwithcheck, pol.polrelid) IS NULL THEN 'true (allows all)'
        ELSE pg_get_expr(pol.polwithcheck, pol.polrelid)
    END as with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public' 
AND cls.relname = 'objekt'
ORDER BY pol.polname;

-- 12. Create a helper function to check user permissions
CREATE OR REPLACE FUNCTION check_objekt_permissions(user_email text)
RETURNS TABLE (
    operation text,
    allowed boolean,
    reason text
) AS $$
DECLARE
    user_id uuid;
    user_role text;
BEGIN
    -- Get user info
    SELECT id, role INTO user_id, user_role
    FROM public.users
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN QUERY
        SELECT 'ALL'::text, false, 'User not found in users table'::text;
        RETURN;
    END IF;
    
    -- Check each operation
    RETURN QUERY
    SELECT 'SELECT'::text, true, 'All authenticated users can read'::text;
    
    RETURN QUERY
    SELECT 'INSERT'::text, true, 'All authenticated users can insert'::text;
    
    RETURN QUERY
    SELECT 'UPDATE'::text, true, 'All authenticated users can update'::text;
    
    RETURN QUERY
    SELECT 'DELETE'::text, 
           CASE WHEN user_role = 'admin' THEN true ELSE false END,
           CASE WHEN user_role = 'admin' THEN 'Admin users can delete' ELSE 'Only admin users can delete' END::text;
END;
$$ LANGUAGE plpgsql;

-- Test the function for Anna Andersson
SELECT * FROM check_objekt_permissions('anna.andersson@example.com');

-- 13. Create a diagnostic function to check why an insert might fail
CREATE OR REPLACE FUNCTION diagnose_objekt_insert_failure(user_email text)
RETURNS TABLE (
    check_name text,
    status text,
    details text
) AS $$
DECLARE
    user_id uuid;
    user_exists boolean;
    rls_enabled boolean;
BEGIN
    -- Check 1: User exists
    SELECT id INTO user_id FROM public.users WHERE email = user_email;
    user_exists := user_id IS NOT NULL;
    
    RETURN QUERY
    SELECT 'User Exists'::text, 
           CASE WHEN user_exists THEN 'PASS' ELSE 'FAIL' END::text,
           CASE WHEN user_exists THEN 'User found with id: ' || user_id::text ELSE 'User not found in users table' END::text;
    
    -- Check 2: RLS is enabled
    SELECT relrowsecurity INTO rls_enabled FROM pg_class WHERE relname = 'objekt';
    
    RETURN QUERY
    SELECT 'RLS Enabled'::text,
           CASE WHEN rls_enabled THEN 'PASS' ELSE 'FAIL' END::text,
           CASE WHEN rls_enabled THEN 'Row Level Security is enabled' ELSE 'Row Level Security is NOT enabled' END::text;
    
    -- Check 3: Insert policy exists
    RETURN QUERY
    SELECT 'Insert Policy'::text,
           CASE WHEN EXISTS (
               SELECT 1 FROM pg_policy pol
               JOIN pg_class cls ON pol.polrelid = cls.oid
               WHERE cls.relname = 'objekt' AND pol.polcmd = 'a'
           ) THEN 'PASS' ELSE 'FAIL' END::text,
           'Insert policy check'::text;
    
    -- Check 4: Required columns
    RETURN QUERY
    SELECT 'Required Columns'::text,
           'INFO'::text,
           'Check that all NOT NULL columns have values or defaults'::text;
END;
$$ LANGUAGE plpgsql;

-- Run diagnostic for Anna Andersson
SELECT * FROM diagnose_objekt_insert_failure('anna.andersson@example.com');

-- 14. Show column constraints that might block insert
SELECT 
    c.column_name,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN c.is_nullable = 'NO' AND c.column_default IS NULL THEN 'REQUIRED - No default'
        WHEN c.is_nullable = 'NO' AND c.column_default IS NOT NULL THEN 'Has default'
        ELSE 'Optional'
    END as insert_requirement
FROM information_schema.columns c
WHERE c.table_schema = 'public'
AND c.table_name = 'objekt'
ORDER BY 
    CASE WHEN c.is_nullable = 'NO' AND c.column_default IS NULL THEN 0 ELSE 1 END,
    c.ordinal_position;