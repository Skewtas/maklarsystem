-- Undersök foreign key constraint för objekt.maklare_id

-- 1. Visa foreign key constraint detaljer
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'objekt'
AND kcu.column_name = 'maklare_id';

-- 2. Kontrollera om användaren finns i auth.users
SELECT id, email 
FROM auth.users 
WHERE id = '6d24c738-80b6-4716-8bb5-5fe025eb0f1f';

-- 3. Om maklare_id refererar till en annan tabell (t.ex. public.users eller maklare)
-- kontrollera den tabellen också
SELECT * FROM public.users WHERE id = '6d24c738-80b6-4716-8bb5-5fe025eb0f1f';

-- 4. Lista alla användare i relevanta tabeller
SELECT 'auth.users' as table_name, id, email FROM auth.users
UNION ALL
SELECT 'public.users' as table_name, id, email FROM public.users;

-- 5. Kontrollera datatypen för maklare_id
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'objekt' 
AND column_name = 'maklare_id';