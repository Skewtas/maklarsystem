# Complete Fix for Objekt Creation Error

## Problem Summary
The objekt creation is failing due to:
1. Authentication/user ID issues
2. Database RLS (Row Level Security) policies expecting users in `public.users` table
3. NextAuth creating users in `next_auth.users` table instead

## Step-by-Step Fix

### Step 1: Quick Database Fix (For Testing)

Run this SQL in your Supabase SQL editor to add your user to the public.users table:

```sql
-- First, find your user in next_auth.users
SELECT id, email, name FROM next_auth.users;

-- Then insert your user into public.users (replace with your actual values)
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'YOUR_USER_ID_FROM_ABOVE', 
  'your@email.com',
  'Your Name',
  'maklare'
);
```

### Step 2: Permanent Solution - User Sync Trigger

Create this trigger to automatically sync users:

```sql
-- Create trigger function to sync users
CREATE OR REPLACE FUNCTION sync_nextauth_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user in public.users
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
    'maklare', -- Default role
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on next_auth.users
CREATE TRIGGER sync_users_after_insert
AFTER INSERT OR UPDATE ON next_auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_nextauth_to_public_users();

-- Sync existing users
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(name, split_part(email, '@', 1)),
  'maklare',
  NOW(),
  NOW()
FROM next_auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();
```

### Step 3: Update RLS Policies (Alternative Approach)

If you prefer to update RLS to work with next_auth.users:

```sql
-- Update RLS policy for objekt table
DROP POLICY IF EXISTS "Users can insert their own objekt" ON objekt;

CREATE POLICY "Users can insert their own objekt" ON objekt
FOR INSERT WITH CHECK (
  auth.uid() = maklare_id 
  AND (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'maklare'))
    OR
    EXISTS (SELECT 1 FROM next_auth.users WHERE id = auth.uid())
  )
);
```

### Step 4: Verify the Fix

1. Check if your user exists in public.users:
```sql
SELECT * FROM public.users WHERE email = 'your@email.com';
```

2. Test objekt creation in the app

3. Check browser console for detailed error logs

## Additional Debugging

If still having issues, add this temporary debug endpoint:

Create `/maklarsystem/src/app/api/debug-auth/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession()
    
    // Check if user exists in public.users
    const { data: publicUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session?.user?.id || '')
      .single()
    
    return NextResponse.json({
      session,
      publicUser,
      error,
      hasAccess: !!publicUser && ['admin', 'maklare'].includes(publicUser.role)
    })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
```

Then visit `/api/debug-auth` to see your authentication status.

## Common Issues

1. **Environment Variables**: Ensure both are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Browser Cookies**: Clear cookies and re-login if having session issues

3. **RLS Policies**: Temporarily disable RLS on objekt table for testing:
   ```sql
   ALTER TABLE objekt DISABLE ROW LEVEL SECURITY;
   ```
   Remember to re-enable after testing!

4. **User Role**: Ensure your user has 'maklare' or 'admin' role in public.users

## Next Steps

1. Run the SQL fixes above
2. Test objekt creation again
3. Check console for new detailed error messages
4. If still failing, use the debug endpoint to verify authentication status