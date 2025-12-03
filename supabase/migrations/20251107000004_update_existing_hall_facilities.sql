-- Migration: Update existing facilities with 'hall' facility_type
-- Description: Update any facilities that still use 'hall' as their facility_type to a valid type
-- Date: 2025-11-07

-- First, let's see if there are any facilities with 'hall' facility_type
-- SELECT id, name, facility_type FROM facilities WHERE facility_type = 'hall';

-- Update any facilities with 'hall' facility_type to 'møterom' (meeting_room)
-- This is a safe default as 'hall' and 'møterom' are similar concepts
UPDATE facilities 
SET facility_type = 'møterom'
WHERE facility_type = 'hall';

-- Verify the update
-- SELECT COUNT(*) as remaining_hall_facilities FROM facilities WHERE facility_type = 'hall';