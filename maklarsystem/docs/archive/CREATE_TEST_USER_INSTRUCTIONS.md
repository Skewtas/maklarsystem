# How to Create Test User

The test user creation via the JavaScript/Node.js script is failing due to database constraints. You need to create the user directly in Supabase SQL Editor.

## Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard/project/[your-project-id]
   - Click on "SQL Editor" in the left sidebar

2. **Run the SQL Script**
   - Copy the entire contents of `/scripts/create-test-user.sql`
   - Paste it into the SQL Editor
   - Click "Run"

3. **Test User Credentials**
   - Email: `test@example.com`
   - Password: `Welcome123!`

## Alternative: Use the existing Rani user

Based on the SQL scripts found, there's already a user created:
- Email: `rani.shakir@hotmail.com`
- Password: `Welcome123!`

You can try logging in with these credentials instead.

## Troubleshooting

If login still fails:

1. **Check if the user exists in auth.users table**:
   ```sql
   SELECT * FROM auth.users WHERE email IN ('test@example.com', 'rani.shakir@hotmail.com');
   ```

2. **Check if email is confirmed**:
   ```sql
   SELECT email, email_confirmed_at FROM auth.users 
   WHERE email IN ('test@example.com', 'rani.shakir@hotmail.com');
   ```

3. **Ensure the user exists in public.users table**:
   ```sql
   SELECT * FROM public.users WHERE email IN ('test@example.com', 'rani.shakir@hotmail.com');
   ```

## Password Information

All test users use the password: `Welcome123!`

This password is hashed in the database as:
`$2b$10$BRpxkqHa7zho9Fw78huexuo/gF2Y8emY7OPNlbJs6Ay8g4dt7woAe`