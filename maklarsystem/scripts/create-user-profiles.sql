-- Create user_profiles for all existing auth users
INSERT INTO user_profiles (user_id, role, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN email IN ('admin@maklarsystem.se', 'rani.shakir@matchahem.se', 'rani.shakir@hotmail.com') THEN 'admin'
    ELSE 'agent'
  END as role,
  NOW(),
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;