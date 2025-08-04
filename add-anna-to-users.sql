-- ADD ANNA TO PUBLIC.USERS TABLE

INSERT INTO public.users (id, email, full_name, role)
VALUES (
  '6d24c738-80b6-4716-8bb5-5fe025eb0f1f',  -- Anna's ID from auth.users
  'anna.andersson@maklarsystem.se',
  'Anna Andersson',
  'maklare'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Verify it worked
SELECT * FROM public.users WHERE email = 'anna.andersson@maklarsystem.se';