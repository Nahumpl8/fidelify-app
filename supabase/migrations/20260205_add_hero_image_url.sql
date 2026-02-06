-- Add hero_image_url column to businesses table
-- This is used by Google Wallet passes as an alternative to strip_image_url

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN businesses.hero_image_url IS 'Alternative hero/banner image for wallet passes (Google: heroImage)';
