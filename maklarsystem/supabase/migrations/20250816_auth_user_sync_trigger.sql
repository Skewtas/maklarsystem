-- ============================================
-- Migration: Auth User Sync Trigger
-- Date: 2025-08-16
-- Description: Ensures auth.users syncs with public.users table
-- ============================================

-- Create or replace the sync function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role := 'maklare';
BEGIN
    -- Insert or update user in public.users table
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        role, 
        phone, 
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name', 
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role, 
            default_role
        ),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        updated_at = NOW();
    
    -- Also create a user_profile entry if it doesn't exist
    INSERT INTO public.user_profiles (user_id, role, created_at, updated_at)
    VALUES (
        NEW.id,
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
            WHEN NEW.raw_user_meta_data->>'role' = 'agent' THEN 'agent'
            ELSE 'user'
        END,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also handle updates to auth.users
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update corresponding record in public.users
    UPDATE public.users 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_user_update: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate update trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF email, raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Sync existing auth users to public.users (one-time sync)
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1)
    ),
    COALESCE(
        (au.raw_user_meta_data->>'role')::user_role,
        'maklare'::user_role
    ),
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Sync existing auth users to user_profiles (one-time sync)
INSERT INTO public.user_profiles (user_id, role, created_at, updated_at)
SELECT 
    au.id,
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
        WHEN au.raw_user_meta_data->>'role' = 'agent' THEN 'agent'
        ELSE 'user'
    END,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
);