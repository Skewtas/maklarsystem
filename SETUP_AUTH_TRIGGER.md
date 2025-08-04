# Setup Authentication Trigger

This document explains how to set up the database trigger that automatically creates users in the `public.users` table when they register through Supabase Auth.

## Step 1: Run the SQL Script

Execute the SQL script in your Supabase SQL Editor:

```sql
-- Navigate to your Supabase project dashboard
-- Go to SQL Editor
-- Paste and run the contents of create_auth_trigger.sql
```

Or if you have direct database access:

```bash
psql -f create_auth_trigger.sql [your-database-url]
```

## Step 2: Verify the Trigger

1. Go to your Supabase project dashboard
2. Navigate to Database → Functions
3. You should see `handle_new_user` function
4. Navigate to Database → Triggers
5. You should see `on_auth_user_created` trigger on `auth.users` table

## Step 3: Test User Registration

1. Start your development server
2. Navigate to `/login`
3. Switch to "Skapa konto" tab
4. Fill in user details and submit
5. Check your email for confirmation
6. After email confirmation, check your `public.users` table - the user should be automatically created

## What the Trigger Does

When a user registers via `supabase.auth.signUp()`:

1. User is created in `auth.users` (managed by Supabase)
2. The trigger automatically runs `handle_new_user()` function
3. Function extracts user data and creates corresponding record in `public.users`
4. User metadata (name, phone) is transferred from auth to public table
5. Default role is set to 'maklare' (can be changed later)

## Troubleshooting

If users are not appearing in `public.users`:

1. Check if the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
3. Check function logs in Supabase Dashboard → Logs
4. Verify RLS policies allow insertions

## Security

The trigger function uses `security definer` which means it runs with the privileges of the function owner, allowing it to bypass RLS policies for the automatic user creation process.