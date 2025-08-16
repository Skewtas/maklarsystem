-- ============================================
-- Migration: Storage Bucket Policies
-- Date: 2025-08-16
-- Description: Ensure proper storage bucket configuration and policies
-- ============================================

-- 1. Ensure property-images bucket exists with correct settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images',
    'property-images',
    false, -- Keep private for controlled access
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heif', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create documents bucket for contracts and documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50MB limit for PDFs
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for property-images bucket
CREATE POLICY "property_images_select" ON storage.objects FOR SELECT 
USING (
    bucket_id = 'property-images' AND 
    (
        auth.uid() IS NOT NULL OR
        -- Allow public access to property images if needed
        EXISTS (
            SELECT 1 FROM objekt o 
            WHERE o.id::text = SPLIT_PART(name, '/', 1)
            AND o.status = 'till_salu'
        )
    )
);

CREATE POLICY "property_images_insert" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'property-images' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare', 'koordinator')
    )
);

CREATE POLICY "property_images_update" ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'property-images' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    )
);

CREATE POLICY "property_images_delete" ON storage.objects FOR DELETE 
USING (
    bucket_id = 'property-images' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    )
);

-- 4. Storage policies for documents bucket
CREATE POLICY "documents_select" ON storage.objects FOR SELECT 
USING (
    bucket_id = 'documents' AND 
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare', 'koordinator')
    )
);

CREATE POLICY "documents_insert" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    )
);

CREATE POLICY "documents_update" ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'documents' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'maklare')
    )
);

CREATE POLICY "documents_delete" ON storage.objects FOR DELETE 
USING (
    bucket_id = 'documents' AND
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);