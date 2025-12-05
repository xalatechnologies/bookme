-- Update location from Spiralen to Fjell
-- This migration updates the localized_db_values table to change "spiralen" to "fjell"

-- First, delete the old "spiralen" entries
DELETE FROM localized_db_values 
WHERE entity_type = 'location' AND entity_key = 'spiralen';

-- Then insert the new "fjell" entries
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
('location', 'fjell', 'en', 'Fjell', 'Fjell area', 4, true),
('location', 'fjell', 'no', 'Fjell', 'Fjell område', 4, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;
