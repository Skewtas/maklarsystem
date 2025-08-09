-- Reset password for rani.shakir@hotmail.com
-- This will set the password to: 69179688AA

UPDATE auth.users
SET 
  encrypted_password = crypt('69179688AA', gen_salt('bf')),
  updated_at = NOW(),
  email_confirmed_at = NOW() -- Ensure email is confirmed
WHERE email = 'rani.shakir@hotmail.com';

-- Verify the update
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'rani.shakir@hotmail.com';