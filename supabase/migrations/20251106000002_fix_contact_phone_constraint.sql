-- Migration: Fix Contact Phone Constraint
-- Description: Updates the contact phone validation constraint to be more flexible

-- Drop the existing constraint
ALTER TABLE facilities
  DROP CONSTRAINT IF EXISTS facilities_contact_phone_check;

-- Add a more flexible validation constraint for phone numbers
-- This allows for various Norwegian phone number formats:
-- - +47 XX XX XX XX
-- - 47 XX XX XX XX
-- - XX XX XX XX
-- - XXXXXXXX
-- - Empty/NULL values
ALTER TABLE facilities
  ADD CONSTRAINT facilities_contact_phone_check
  CHECK (
    contact_phone IS NULL 
    OR contact_phone = ''
    OR contact_phone ~* '^(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$'
    OR contact_phone ~* '^\d{8}$'
    OR contact_phone ~* '^47\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$'
  );

-- Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Complete: Fixed Contact Phone Constraint';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Updated constraint allows:';
  RAISE NOTICE '  - NULL values';
  RAISE NOTICE '  - Empty strings';
  RAISE NOTICE '  - +47 XX XX XX XX';
  RAISE NOTICE '  - 47 XX XX XX XX';
  RAISE NOTICE '  - XX XX XX XX';
  RAISE NOTICE '  - XXXXXXXX';
  RAISE NOTICE '========================================';
END $$;