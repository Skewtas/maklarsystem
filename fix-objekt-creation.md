# Fix for Objekt Creation Issues

## Problem Summary

1. **ReferenceError Fixed**: The `apiData` variable was not accessible in the catch block. This has been fixed by declaring it outside the try block.

2. **Database Permission Issue**: The main issue is that the Row Level Security (RLS) policies expect users to exist in the `public.users` table with the correct role ('admin' or 'maklare'), but NextAuth creates users in the `next_auth.users` table.

## Solution

### Option 1: Quick Fix - Manually Add User to public.users

Run this SQL in your Supabase SQL editor to add your user:

```sql
-- Replace 'your-email@example.com' with your actual email
-- Replace 'Your Name' with your actual name
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id,
    email,
    name,
    'maklare'::user_role,
    now(),
    now()
FROM next_auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'maklare'::user_role;
```

### Option 2: Permanent Fix - Create Sync Trigger

Create a new migration file `supabase/migrations/20250131_sync_nextauth_users.sql`:

```sql
-- Create function to sync NextAuth users with public.users table
CREATE OR REPLACE FUNCTION sync_nextauth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user in public.users table
    INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.name,
        'maklare'::user_role, -- Default role for new users
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync on insert/update of NextAuth users
CREATE TRIGGER sync_nextauth_user_trigger
AFTER INSERT OR UPDATE ON next_auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_nextauth_user();

-- Sync existing NextAuth users to public.users
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id,
    email,
    name,
    'maklare'::user_role,
    created_at,
    updated_at
FROM next_auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = EXCLUDED.updated_at;

-- Update RLS policy to be more flexible during transition
DROP POLICY IF EXISTS "Mäklare can create objekt" ON objekt;
CREATE POLICY "Authenticated users can create objekt" 
ON objekt FOR INSERT TO authenticated 
WITH CHECK (
    -- Allow if user exists in public.users with correct role
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'maklare'))
    OR
    -- Allow if user is authenticated and we're in transition period
    auth.uid() IS NOT NULL
);

-- Add comment explaining the policy
COMMENT ON POLICY "Authenticated users can create objekt" ON objekt IS 
'Allows object creation for authenticated users. During transition, all authenticated users can create objects. Later, restrict to only admin/maklare roles.';
```

### Option 3: Temporary Workaround - Disable RLS

For testing purposes only, you can temporarily disable RLS on the objekt table:

```sql
-- WARNING: Only for testing! Re-enable RLS in production
ALTER TABLE objekt DISABLE ROW LEVEL SECURITY;
```

## Code Changes Already Made

1. Fixed the ReferenceError in `/maklarsystem/src/app/nytt/page.tsx`:
   - Moved `apiData` declaration outside the try block
   - Added user authentication check
   - Using actual user ID instead of hardcoded UUID
   - Better error logging including userId

## Testing Steps

1. First, apply one of the SQL solutions above
2. Sign in to the application
3. Navigate to "Nytt Objekt" page
4. Fill in the required fields:
   - Typ (Type)
   - Adress (Address)
   - Postnummer (Postal code)
   - Ort (City)
   - Kommun (Municipality)
5. Click "Spara Objekt"

## Expected Behavior

After applying the fix, you should be able to create objects successfully. The object will be created with:
- Your user ID as the `maklare_id`
- Status set to 'kundbearbetning' by default
- Län (County) defaulting to 'Stockholm' if not specified

## Additional Notes

- The validation schema expects all required fields to be filled
- The form uses Swedish language for labels and error messages
- Toast notifications will show success or error messages
- After successful creation, you'll be redirected to the objects list page