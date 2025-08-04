-- CHECK ALL USERS IN PUBLIC.USERS TABLE
SELECT id, email, full_name, role, created_at
FROM public.users
ORDER BY created_at DESC;