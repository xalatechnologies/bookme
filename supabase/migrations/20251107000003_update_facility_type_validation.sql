-- Migration: Update facility type validation to remove 'hall'
-- Description: Update the facility type validation function to remove 'hall' from valid keys and update hint message
-- Date: 2025-11-07

-- Update the validation function to remove 'hall' from the hint message
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
        USING HINT = 'Valid keys: idrettshall, kulturhus, møterom, fotballbane, svømmehall, tennisbane';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify that no facilities are using 'hall' as facility_type
-- SELECT id, name, facility_type FROM facilities WHERE facility_type = 'hall';