/**
 * Critical Data Normalization Migration
 *
 * This migration normalizes existing facility_type and amenities data
 * to align with the localization system expectations.
 *
 * Changes:
 * 1. Normalize facility_type from display labels to keys
 * 2. Normalize amenities arrays to use lowercase kebab-case keys
 * 3. Add validation constraints to prevent future misalignment
 */

-- ============================================================================
-- Part 1: Add Slug Column for SEO-Friendly URLs
-- ============================================================================

-- Add slug column to facilities table
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS slug text;

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION generate_facility_slug(facility_name text, facility_id uuid)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- Normalize name to slug: lowercase, replace spaces/special chars with hyphens
  base_slug := LOWER(TRIM(facility_name));
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '', 'g');  -- Remove leading/trailing hyphens

  final_slug := base_slug;

  -- Check for uniqueness, append number if needed
  WHILE EXISTS (
    SELECT 1 FROM facilities
    WHERE slug = final_slug
    AND id != facility_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for all existing facilities
UPDATE facilities
SET slug = generate_facility_slug(name, id)
WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE facilities
  ADD CONSTRAINT facilities_slug_unique UNIQUE (slug),
  ALTER COLUMN slug SET NOT NULL;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_facilities_slug ON facilities(slug);

COMMENT ON COLUMN facilities.slug IS 'SEO-friendly URL slug (e.g., drammen-idrettshall)';

-- Trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_facility_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_facility_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_generate_facility_slug_trigger ON facilities;
CREATE TRIGGER auto_generate_facility_slug_trigger
  BEFORE INSERT ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_facility_slug();

-- ============================================================================
-- Part 2: Normalize facility_type Column
-- ============================================================================

-- Create mapping function for facility types
CREATE OR REPLACE FUNCTION normalize_facility_type(raw_type text)
RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN LOWER(raw_type) IN ('idrettshall', 'sports hall') THEN 'idrettshall'
    WHEN LOWER(raw_type) IN ('kulturhus', 'cultural center') THEN 'kulturhus'
    WHEN LOWER(raw_type) IN ('møterom', 'meeting room') THEN 'møterom'
    WHEN LOWER(raw_type) IN ('fotballbane', 'football field', 'soccer field') THEN 'fotballbane'
    WHEN LOWER(raw_type) IN ('svømmehall', 'swimming pool', 'pool') THEN 'svømmehall'
    WHEN LOWER(raw_type) IN ('tennisbane', 'tennis court') THEN 'tennisbane'
    WHEN LOWER(raw_type) IN ('hall', 'general hall') THEN 'hall'
    ELSE LOWER(REPLACE(REPLACE(raw_type, ' ', '-'), '/', '-'))
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_facility_type IS
  'Converts display labels to normalized keys for localization system';

-- Update existing facility_type values
UPDATE facilities
SET facility_type = normalize_facility_type(facility_type)
WHERE facility_type IS NOT NULL;

-- ============================================================================
-- Part 2: Normalize Amenities Arrays
-- ============================================================================

-- Create function to normalize a single amenity string
CREATE OR REPLACE FUNCTION normalize_amenity(raw_amenity text)
RETURNS text AS $$
DECLARE
  normalized text;
BEGIN
  -- Convert to lowercase, replace spaces and slashes with hyphens
  normalized := LOWER(TRIM(raw_amenity));
  normalized := REPLACE(normalized, '/', '-');
  normalized := REPLACE(normalized, ' ', '-');
  normalized := REPLACE(normalized, 'æ', 'ae');
  normalized := REPLACE(normalized, 'ø', 'o');
  normalized := REPLACE(normalized, 'å', 'a');

  -- Handle common variations
  RETURN CASE
    -- Exact matches from localized_db_values
    WHEN normalized IN ('garderober', 'dusj', 'parkering', 'lyd-lys', 'tribuner',
                        'scene', 'projektor', 'kjøkken', 'video-konferanse',
                        'tavle', 'wifi', 'kaffe-te', 'klimaanlegg', 'whiteboard',
                        'kunstgress', 'flombelysning', '25m-basseng', 'barnebasseng',
                        'badstue', 'cafeteria', 'innendørs', 'profesjonell-underlag',
                        'utstyr-utleie', 'fotball', 'basketball') THEN normalized

    -- Common variations
    WHEN normalized = 'lyd-og-lys' THEN 'lyd-lys'
    WHEN normalized IN ('lyd', 'lys') THEN 'lyd-lys'
    WHEN normalized IN ('garderobe', 'changing-rooms', 'locker-rooms') THEN 'garderober'
    WHEN normalized IN ('shower', 'showers', 'dusjer') THEN 'dusj'
    WHEN normalized IN ('parking', 'parkingplass') THEN 'parkering'
    WHEN normalized IN ('stands', 'bleachers', 'seating') THEN 'tribuner'
    WHEN normalized IN ('stage', 'scenen') THEN 'scene'
    WHEN normalized IN ('projector', 'beamer') THEN 'projektor'
    WHEN normalized IN ('kitchen', 'catering') THEN 'kjøkken'
    WHEN normalized IN ('video-conference', 'videokonferanse', 'zoom') THEN 'video-konferanse'
    WHEN normalized IN ('board', 'blackboard') THEN 'tavle'
    WHEN normalized IN ('wi-fi', 'internet', 'wireless') THEN 'wifi'
    WHEN normalized IN ('coffee', 'tea', 'kaffe', 'te') THEN 'kaffe-te'
    WHEN normalized IN ('hvac', 'air-conditioning', 'ac') THEN 'klimaanlegg'
    WHEN normalized IN ('artificial-grass', 'turf') THEN 'kunstgress'
    WHEN normalized IN ('floodlights', 'lights', 'belysning') THEN 'flombelysning'
    WHEN normalized IN ('pool', 'basseng', 'swimming-pool') THEN '25m-basseng'
    WHEN normalized IN ('kids-pool', 'children-pool') THEN 'barnebasseng'
    WHEN normalized IN ('sauna') THEN 'badstue'
    WHEN normalized IN ('cafe', 'kafe', 'kafeteria') THEN 'cafeteria'
    WHEN normalized IN ('indoor', 'inside', 'innendors') THEN 'innendørs'
    WHEN normalized IN ('professional-surface', 'pro-surface') THEN 'profesjonell-underlag'
    WHEN normalized IN ('equipment-rental', 'rental', 'leie') THEN 'utstyr-utleie'
    WHEN normalized IN ('soccer', 'football-field') THEN 'fotball'

    -- If no match, return normalized version
    ELSE normalized
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_amenity IS
  'Converts raw amenity strings to normalized keys matching localized_db_values';

-- Function to normalize entire amenities array for a facility
CREATE OR REPLACE FUNCTION normalize_amenities_array(amenities_json jsonb)
RETURNS jsonb AS $$
DECLARE
  normalized_array jsonb := '[]'::jsonb;
  amenity_value text;
BEGIN
  -- Return empty array if input is null
  IF amenities_json IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Process each amenity in the array
  FOR amenity_value IN
    SELECT jsonb_array_elements_text(amenities_json)
  LOOP
    normalized_array := normalized_array ||
      jsonb_build_array(normalize_amenity(amenity_value));
  END LOOP;

  RETURN normalized_array;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all existing facilities' amenities
UPDATE facilities
SET amenities = normalize_amenities_array(amenities)
WHERE amenities IS NOT NULL AND amenities != '[]'::jsonb;

-- Update all existing zones' amenities (zones also have amenities)
UPDATE zones
SET amenities = normalize_amenities_array(amenities)
WHERE amenities IS NOT NULL AND amenities != '[]'::jsonb;

-- ============================================================================
-- Part 3: Add Validation Constraints
-- ============================================================================

-- Function to validate facility_type exists in localized_db_values
CREATE OR REPLACE FUNCTION validate_facility_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.facility_type IS NOT NULL THEN
    -- Check if the facility_type exists as a key in localized_db_values
    IF NOT EXISTS (
      SELECT 1 FROM localized_db_values
      WHERE entity_type = 'facility_type'
      AND entity_key = NEW.facility_type
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Invalid facility_type: %. Must be a valid key in localized_db_values (facility_type)',
        NEW.facility_type
        USING HINT = 'Valid keys: idrettshall, kulturhus, møterom, fotballbane, svømmehall, tennisbane, hall';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for facility_type validation
DROP TRIGGER IF EXISTS validate_facility_type_trigger ON facilities;
CREATE TRIGGER validate_facility_type_trigger
  BEFORE INSERT OR UPDATE OF facility_type ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION validate_facility_type();

COMMENT ON TRIGGER validate_facility_type_trigger ON facilities IS
  'Ensures facility_type is a valid normalized key from localized_db_values';

-- Function to validate amenities array
CREATE OR REPLACE FUNCTION validate_amenities()
RETURNS TRIGGER AS $$
DECLARE
  amenity_key text;
  invalid_keys text[] := ARRAY[]::text[];
BEGIN
  IF NEW.amenities IS NOT NULL AND NEW.amenities != '[]'::jsonb THEN
    -- Check each amenity in the array
    FOR amenity_key IN
      SELECT jsonb_array_elements_text(NEW.amenities)
    LOOP
      -- Check if amenity exists in localized_db_values
      IF NOT EXISTS (
        SELECT 1 FROM localized_db_values
        WHERE entity_type = 'amenity'
        AND entity_key = amenity_key
        AND is_active = true
      ) THEN
        invalid_keys := array_append(invalid_keys, amenity_key);
      END IF;
    END LOOP;

    -- If there are invalid keys, raise exception
    IF array_length(invalid_keys, 1) > 0 THEN
      RAISE EXCEPTION 'Invalid amenity keys: %. All amenities must exist in localized_db_values (amenity)',
        array_to_string(invalid_keys, ', ')
        USING HINT = 'Check localized_db_values table for valid amenity keys or add new ones first';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for amenities validation on facilities
DROP TRIGGER IF EXISTS validate_facilities_amenities_trigger ON facilities;
CREATE TRIGGER validate_facilities_amenities_trigger
  BEFORE INSERT OR UPDATE OF amenities ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION validate_amenities();

-- Create trigger for amenities validation on zones
DROP TRIGGER IF EXISTS validate_zones_amenities_trigger ON zones;
CREATE TRIGGER validate_zones_amenities_trigger
  BEFORE INSERT OR UPDATE OF amenities ON zones
  FOR EACH ROW
  EXECUTE FUNCTION validate_amenities();

COMMENT ON FUNCTION validate_amenities IS
  'Ensures all amenities in JSONB array are valid keys from localized_db_values';

-- ============================================================================
-- Part 4: Verification Queries
-- ============================================================================

-- Report on normalization results
DO $$
DECLARE
  facilities_updated int;
  zones_updated int;
  unique_facility_types int;
  unique_amenities int;
BEGIN
  SELECT COUNT(*) INTO facilities_updated FROM facilities;
  SELECT COUNT(*) INTO zones_updated FROM zones WHERE amenities != '[]'::jsonb;
  SELECT COUNT(DISTINCT facility_type) INTO unique_facility_types FROM facilities;

  SELECT COUNT(DISTINCT elem) INTO unique_amenities
  FROM facilities, jsonb_array_elements_text(amenities) elem;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Data Normalization Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Facilities processed: %', facilities_updated;
  RAISE NOTICE 'Zones with amenities: %', zones_updated;
  RAISE NOTICE 'Unique facility types: %', unique_facility_types;
  RAISE NOTICE 'Unique amenities: %', unique_amenities;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Validation triggers installed:';
  RAISE NOTICE '  - validate_facility_type_trigger';
  RAISE NOTICE '  - validate_facilities_amenities_trigger';
  RAISE NOTICE '  - validate_zones_amenities_trigger';
  RAISE NOTICE '========================================';
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_facilities_facility_type ON facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_facilities_amenities_gin ON facilities USING gin(amenities);
CREATE INDEX IF NOT EXISTS idx_zones_amenities_gin ON zones USING gin(amenities);

COMMENT ON INDEX idx_facilities_facility_type IS 'Fast lookups for facility type filtering';
COMMENT ON INDEX idx_facilities_amenities_gin IS 'Fast containment queries for amenities';
COMMENT ON INDEX idx_zones_amenities_gin IS 'Fast containment queries for zone amenities';
