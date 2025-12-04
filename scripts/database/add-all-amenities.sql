-- Add ALL Required Amenity Keys to localized_db_values Table
--
-- This adds all amenities used in the seed script to ensure validation passes

-- Insert all amenities (Norwegian)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, is_active)
VALUES
  -- Basic facilities
  ('amenity', 'garderober', 'no', 'Garderober', true),
  ('amenity', 'dusj', 'no', 'Dusj', true),
  ('amenity', 'parkering', 'no', 'Parkering', true),
  ('amenity', 'lyd-lys', 'no', 'Lyd/lys', true),
  ('amenity', 'tribuner', 'no', 'Tribuner', true),

  -- Cultural/meeting facilities
  ('amenity', 'scene', 'no', 'Scene', true),
  ('amenity', 'projektor', 'no', 'Projektor', true),
  ('amenity', 'kjøkken', 'no', 'Kjøkken', true),
  ('amenity', 'tavle', 'no', 'Tavle', true),
  ('amenity', 'wifi', 'no', 'WiFi', true),
  ('amenity', 'kaffe-te', 'no', 'Kaffe/te', true),
  ('amenity', 'video-konferanse', 'no', 'Video konferanse', true),
  ('amenity', 'klimaanlegg', 'no', 'Klimaanlegg', true),
  ('amenity', 'whiteboard', 'no', 'Whiteboard', true),

  -- Sports facilities
  ('amenity', 'flombelysning', 'no', 'Flombelysning', true),
  ('amenity', 'kunstgress', 'no', 'Kunstgress', true),
  ('amenity', 'fotball', 'no', 'Fotball', true),
  ('amenity', 'basketball', 'no', 'Basketball', true),
  ('amenity', 'innendørs', 'no', 'Innendørs', true),
  ('amenity', 'profesjonell-underlag', 'no', 'Profesjonell underlag', true),
  ('amenity', 'utstyr-utleie', 'no', 'Utstyr utleie', true),

  -- Pool facilities
  ('amenity', '25m-basseng', 'no', '25m basseng', true),
  ('amenity', 'barnebasseng', 'no', 'Barnebasseng', true),
  ('amenity', 'badstue', 'no', 'Badstue', true),
  ('amenity', 'cafeteria', 'no', 'Cafeteria', true)
ON CONFLICT (entity_type, entity_key, language_code) DO NOTHING;

-- Insert all amenities (English)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, is_active)
VALUES
  -- Basic facilities
  ('amenity', 'garderober', 'en', 'Locker rooms', true),
  ('amenity', 'dusj', 'en', 'Showers', true),
  ('amenity', 'parkering', 'en', 'Parking', true),
  ('amenity', 'lyd-lys', 'en', 'Sound/lighting', true),
  ('amenity', 'tribuner', 'en', 'Bleachers', true),

  -- Cultural/meeting facilities
  ('amenity', 'scene', 'en', 'Stage', true),
  ('amenity', 'projektor', 'en', 'Projector', true),
  ('amenity', 'kjøkken', 'en', 'Kitchen', true),
  ('amenity', 'tavle', 'en', 'Blackboard', true),
  ('amenity', 'wifi', 'en', 'WiFi', true),
  ('amenity', 'kaffe-te', 'en', 'Coffee/tea', true),
  ('amenity', 'video-konferanse', 'en', 'Video conference', true),
  ('amenity', 'klimaanlegg', 'en', 'Air conditioning', true),
  ('amenity', 'whiteboard', 'en', 'Whiteboard', true),

  -- Sports facilities
  ('amenity', 'flombelysning', 'en', 'Floodlights', true),
  ('amenity', 'kunstgress', 'en', 'Artificial turf', true),
  ('amenity', 'fotball', 'en', 'Football', true),
  ('amenity', 'basketball', 'en', 'Basketball', true),
  ('amenity', 'innendørs', 'en', 'Indoor', true),
  ('amenity', 'profesjonell-underlag', 'en', 'Professional surface', true),
  ('amenity', 'utstyr-utleie', 'en', 'Equipment rental', true),

  -- Pool facilities
  ('amenity', '25m-basseng', 'en', '25m pool', true),
  ('amenity', 'barnebasseng', 'en', 'Children''s pool', true),
  ('amenity', 'badstue', 'en', 'Sauna', true),
  ('amenity', 'cafeteria', 'en', 'Cafeteria', true)
ON CONFLICT (entity_type, entity_key, language_code) DO NOTHING;

-- Verify all amenities were added
SELECT entity_type, entity_key, language_code, label
FROM localized_db_values
WHERE entity_type = 'amenity'
ORDER BY entity_key, language_code;

-- Count total amenities
SELECT
  COUNT(DISTINCT entity_key) as unique_amenities,
  COUNT(*) as total_rows
FROM localized_db_values
WHERE entity_type = 'amenity';
