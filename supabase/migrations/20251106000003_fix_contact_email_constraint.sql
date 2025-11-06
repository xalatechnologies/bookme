-- Migration: Fix Contact Email Constraint
-- Description: Updates the contact email validation constraint to be more flexible

-- Drop the existing constraint
ALTER TABLE facilities
  DROP CONSTRAINT IF EXISTS facilities_contact_email_check;

-- Add a more flexible validation constraint for email addresses
-- This allows for:
-- - NULL values
-- - Empty strings
-- - Valid email addresses
ALTER TABLE facilities
  ADD CONSTRAINT facilities_contact_email_check
  CHECK (
    contact_email IS NULL 
    OR contact_email = ''
    OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Complete: Fixed Contact Email Constraint';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Updated constraint allows:';
  RAISE NOTICE '  - NULL values';
  RAISE NOTICE '  - Empty strings';
  RAISE NOTICE '  - Valid email addresses';
  RAISE NOTICE '========================================';
END $$;