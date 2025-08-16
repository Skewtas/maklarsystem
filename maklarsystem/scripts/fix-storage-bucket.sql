-- Fix Storage Bucket Policies for property-images
-- Run this in Supabase SQL Editor

-- 1. Create bucket if not exists (run in Dashboard > Storage first)
-- Note: Bucket creation must be done via Dashboard or API, not SQL

-- 2. Storage policies for property-images bucket
-- These allow authenticated users to upload/read images for their own properties

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload images for their properties" ON storage.objects;
DROP POLICY IF EXISTS "Users can view images for accessible properties" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their property images" ON storage.objects;

-- Create new policies
-- Allow authenticated users to upload images to property-images bucket
CREATE POLICY "Users can upload images for their properties"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Alternative: Allow any authenticated user to upload (less restrictive)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow anyone to view images (since we use signed URLs anyway)
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Check existing policies
SELECT * FROM storage.policies;