-- Add Missing Amenity Keys to localized_db_values Table
--
-- Run this SQL in Supabase Dashboard SQL Editor to add the missing amenity keys
-- that are required for facility seeding

-- Insert missing amenities (Norwegian)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, is_active)
VALUES
  ('amenity', 'tavle', 'no', 'Tavle', true),
  ('amenity', 'kaffe-te', 'no', 'Kaffe/te', true),
  ('amenity', 'video-konferanse', 'no', 'Video konferanse', true)
ON CONFLICT (entity_type, entity_key, language_code) DO NOTHING;

-- Insert missing amenities (English)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, is_active)
VALUES
  ('amenity', 'tavle', 'en', 'Blackboard', true),
  ('amenity', 'kaffe-te', 'en', 'Coffee/tea', true),
  ('amenity', 'video-konferanse', 'en', 'Video conference', true)
ON CONFLICT (entity_type, entity_key, language_code) DO NOTHING;

-- Verify the amenities were added
SELECT entity_type, entity_key, language_code, label
FROM localized_db_values
WHERE entity_type = 'amenity'
  AND entity_key IN ('tavle', 'kaffe-te', 'video-konferanse')
ORDER BY entity_key, language_code;
