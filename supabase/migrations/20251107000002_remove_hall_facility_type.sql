-- Migration: Remove 'hall' facility type
-- Description: Remove the 'hall' facility type from localized database values as it's no longer supported
-- Date: 2025-11-07

-- Remove 'hall' facility type entries
DELETE FROM localized_db_values 
WHERE entity_type = 'facility_type' AND entity_key = 'hall';

-- Also mark as inactive if for some reason there are references we want to preserve
UPDATE localized_db_values 
SET is_active = false, updated_at = now()
WHERE entity_type = 'facility_type' AND entity_key = 'hall' 
AND is_active = true;

-- Verify the change by checking remaining facility types
-- SELECT entity_key, label FROM localized_db_values WHERE entity_type = 'facility_type' ORDER BY sort_order;