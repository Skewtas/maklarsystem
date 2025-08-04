-- ADD RANI TO PUBLIC.USERS TABLE

INSERT INTO public.users (id, email, full_name, role)
VALUES (
  '263fefed-dac0-433f-a169-5d7fa2823dc7',
  'rani.shakir@matchahem.se',
  'Rani Shakir',
  'maklare'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Verify it worked
SELECT * FROM public.users WHERE email = 'rani.shakir@matchahem.se';