-- Create facility-images bucket for Supabase Storage
-- This bucket will store all facility images uploaded through the admin interface

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-images', 'facility-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up bucket policies for public read access (for displaying images)
-- Note: These policies would typically be set up through the Supabase dashboard
-- but we're including them here for reference

-- Policy for public read access to facility images
-- CREATE POLICY "Public Access for Facility Images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'facility-images');

-- Policy for authenticated users to upload images
-- CREATE POLICY "Authenticated Users Can Upload Facility Images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'facility-images' AND auth.role() = 'authenticated');

-- Policy for users to update their own facility images
-- CREATE POLICY "Users Can Update Their Facility Images"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'facility-images' AND auth.role() = 'authenticated');

-- Policy for users to delete their own facility images
-- CREATE POLICY "Users Can Delete Their Facility Images"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'facility-images' AND auth.role() = 'authenticated');