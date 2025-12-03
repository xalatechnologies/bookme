-- Migration: Update normalize_facility_type function to remove 'hall' mapping
-- Description: Update the normalize_facility_type function to no longer map 'hall' or 'general hall' to 'hall'
-- Date: 2025-11-07

-- Update the normalize_facility_type function to remove 'hall' mapping
-- Map 'hall' and 'general hall' to 'møterom' instead as a safe default
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
    -- Map 'hall' and 'general hall' to 'møterom' instead of 'hall'
    WHEN LOWER(raw_type) IN ('hall', 'general hall') THEN 'møterom'
    ELSE LOWER(REPLACE(REPLACE(raw_type, ' ', '-'), '/', '-'))
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_facility_type IS
  'Converts display labels to normalized keys for localization system. Note: "hall" and "general hall" are now mapped to "møterom" as "hall" is deprecated.';