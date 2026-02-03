-- =========================================
-- Supabase Storage: program-assets bucket
-- =========================================
-- Run this in Supabase SQL Editor to set up the storage bucket
-- for uploading logos, stamps, and strip images

-- Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-assets',
  'program-assets',
  true,  -- Public bucket for easy access to images
  5242880,  -- 5MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

-- =========================================
-- Storage Policies
-- =========================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their business files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their business files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for program assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their organization folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their organization files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their organization files" ON storage.objects;

-- Policy: Allow authenticated users to upload files to their business folder
-- Users can upload if they are owner or active employee of the business
CREATE POLICY "Users can upload to their business folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'program-assets' AND
  (storage.foldername(name))[1] IN (
    -- Business owner
    SELECT id::text FROM businesses WHERE owner_user_id = auth.uid()
    UNION
    -- Active employees
    SELECT business_id::text FROM employees
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Allow authenticated users to update their business files
CREATE POLICY "Users can update their business files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'program-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_user_id = auth.uid()
    UNION
    SELECT business_id::text FROM employees
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Allow authenticated users to delete their business files
CREATE POLICY "Users can delete their business files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'program-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_user_id = auth.uid()
    UNION
    SELECT business_id::text FROM employees
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Allow public read access (since bucket is public)
CREATE POLICY "Public read access for program assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'program-assets');
