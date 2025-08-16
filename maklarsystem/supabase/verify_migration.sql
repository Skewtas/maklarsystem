-- ============================================
-- Verification Script for Migration
-- Date: 2025-08-16
-- ============================================

-- 1. Check if auth trigger exists and is working
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as is_enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 2. Check all tables exist
SELECT tablename, 
       CASE 
           WHEN tablename IN ('objekt', 'kontakter', 'visningar', 'bud', 'users', 'uppgifter', 'kalenderhändelser', 'notifikationer', 'property_images', 'user_profiles')
           THEN '✅ Core table'
           WHEN tablename IN ('dokument', 'dokumentmallar', 'intresseanmalan', 'bud_historik', 'marknadsstatistik')
           THEN '✅ New table'
           ELSE '⚠️ Other'
       END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check important columns on objekt table
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('fastighetsbeteckning', 'energiklass', 'avgift_manad', 'taxeringsvarde')
        THEN '✅ Swedish field added'
        ELSE '📋 Standard field'
    END as status
FROM information_schema.columns
WHERE table_name = 'objekt' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check indexes
SELECT 
    indexname,
    CASE 
        WHEN indexname LIKE '%trgm%' THEN '🔍 Text search index'
        WHEN indexname LIKE '%brin%' THEN '📊 BRIN index'
        WHEN indexname LIKE '%active%' OR indexname LIKE '%future%' THEN '⚡ Partial index'
        ELSE '📍 Standard index'
    END as type
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('objekt', 'kontakter', 'property_images', 'visningar', 'bud')
ORDER BY tablename, indexname;

-- 5. Check RLS policies
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 6. Check storage buckets
SELECT 
    id as bucket_name,
    public as is_public,
    file_size_limit / 1048576 as size_limit_mb,
    array_length(allowed_mime_types, 1) as allowed_types_count
FROM storage.buckets;

-- 7. Check if auth.users are synced to public.users
SELECT 
    'Auth Users' as source,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as source,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'User Profiles' as source,
    COUNT(*) as count
FROM public.user_profiles;

-- 8. Summary report
SELECT 
    'Migration Status Report' as report,
    NOW() as timestamp,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
        THEN '✅ Auth sync trigger installed'
        ELSE '❌ Auth sync trigger MISSING'
    END as auth_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dokument')
        THEN '✅ New tables created'
        ELSE '❌ New tables MISSING'
    END as tables_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'objekt' AND column_name = 'fastighetsbeteckning')
        THEN '✅ Swedish fields added'
        ELSE '❌ Swedish fields MISSING'
    END as fields_status;