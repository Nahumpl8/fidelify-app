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

-- Policy: Allow authenticated users to upload files to their org folder
CREATE POLICY "Users can upload to their organization folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'program-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations
    WHERE id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Allow authenticated users to update their org files
CREATE POLICY "Users can update their organization files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'program-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations
    WHERE id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Allow authenticated users to delete their org files
CREATE POLICY "Users can delete their organization files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'program-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations
    WHERE id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Allow public read access (since bucket is public)
CREATE POLICY "Public read access for program assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'program-assets');

-- =========================================
-- Alternative: Simple policies (if org setup is not ready)
-- =========================================
-- Uncomment these if you want simpler policies during development

-- DROP POLICY IF EXISTS "Users can upload to their organization folder" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their organization files" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their organization files" ON storage.objects;

-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'program-assets');

-- CREATE POLICY "Authenticated users can update"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'program-assets');

-- CREATE POLICY "Authenticated users can delete"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'program-assets');
