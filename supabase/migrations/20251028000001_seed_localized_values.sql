-- Migration: Seed Localized Database Values
-- Description: Populate localized_db_values with common UI selections
-- Date: 2025-10-28

-- Facility Types
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('facility_type', 'idrettshall', 'no', 'Idrettshall', 1),
  ('facility_type', 'idrettshall', 'en', 'Sports Hall', 1),
  ('facility_type', 'kulturhus', 'no', 'Kulturhus', 2),
  ('facility_type', 'kulturhus', 'en', 'Culture House', 2),
  ('facility_type', 'møterom', 'no', 'Møterom', 3),
  ('facility_type', 'møterom', 'en', 'Meeting Room', 3),
  ('facility_type', 'hall', 'no', 'Hall', 4),
  ('facility_type', 'hall', 'en', 'Hall', 4)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, updated_at = now();

-- Message Types
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('message_type', 'all', 'no', 'Alle', 1),
  ('message_type', 'all', 'en', 'All', 1),
  ('message_type', 'system', 'no', 'System', 2),
  ('message_type', 'system', 'en', 'System', 2),
  ('message_type', 'booking', 'no', 'Booking', 3),
  ('message_type', 'booking', 'en', 'Booking', 3),
  ('message_type', 'news', 'no', 'Nyheter', 4),
  ('message_type', 'news', 'en', 'News', 4)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, updated_at = now();

-- Duration Options
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order, metadata) VALUES
  ('duration', '1', 'no', '1 time', 1, '{"hours": 1}'::jsonb),
  ('duration', '1', 'en', '1 hour', 1, '{"hours": 1}'::jsonb),
  ('duration', '2', 'no', '2 timer', 2, '{"hours": 2}'::jsonb),
  ('duration', '2', 'en', '2 hours', 2, '{"hours": 2}'::jsonb),
  ('duration', '4', 'no', '4 timer', 3, '{"hours": 4}'::jsonb),
  ('duration', '4', 'en', '4 hours', 3, '{"hours": 4}'::jsonb),
  ('duration', '8', 'no', '8 timer', 4, '{"hours": 8}'::jsonb),
  ('duration', '8', 'en', '8 hours', 4, '{"hours": 8}'::jsonb),
  ('duration', 'all', 'no', 'Alle varigheter', 0, '{"hours": null}'::jsonb),
  ('duration', 'all', 'en', 'All durations', 0, '{"hours": null}'::jsonb)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = now();

-- Payment Methods
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('payment_method', 'all', 'no', 'Alle metoder', 0),
  ('payment_method', 'all', 'en', 'All methods', 0),
  ('payment_method', 'visa', 'no', 'Visa', 1),
  ('payment_method', 'visa', 'en', 'Visa', 1),
  ('payment_method', 'mastercard', 'no', 'Mastercard', 2),
  ('payment_method', 'mastercard', 'en', 'Mastercard', 2),
  ('payment_method', 'invoice', 'no', 'Faktura', 3),
  ('payment_method', 'invoice', 'en', 'Invoice', 3)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, updated_at = now();

-- Filter Categories  
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('filter_category', 'all', 'no', 'Alle', 0),
  ('filter_category', 'all', 'en', 'All', 0),
  ('filter_category', 'active', 'no', 'Aktive', 1),
  ('filter_category', 'active', 'en', 'Active', 1),
  ('filter_category', 'upcoming', 'no', 'Kommende', 2),
  ('filter_category', 'upcoming', 'en', 'Upcoming', 2),
  ('filter_category', 'past', 'no', 'Tidligere', 3),
  ('filter_category', 'past', 'en', 'Past', 3)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, updated_at = now();

-- Years (dynamic, but seed common ones)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('year', 'all', 'no', 'Alle år', 0),
  ('year', 'all', 'en', 'All years', 0),
  ('year', '2024', 'no', '2024', 1),
  ('year', '2024', 'en', '2024', 1),
  ('year', '2023', 'no', '2023', 2),
  ('year', '2023', 'en', '2023', 2),
  ('year', '2025', 'no', '2025', 3),
  ('year', '2025', 'en', '2025', 3)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, updated_at = now();

-- Common labels used across forms
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label) VALUES
  ('common_label', 'status', 'no', 'Status'),
  ('common_label', 'status', 'en', 'Status'),
  ('common_label', 'all', 'no', 'Alle'),
  ('common_label', 'all', 'en', 'All'),
  ('common_label', 'view_details', 'no', 'Se detaljer'),
  ('common_label', 'view_details', 'en', 'View details')
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
  SET label = EXCLUDED.label, updated_at = now();

-- Grant permissions
GRANT SELECT ON localized_db_values TO authenticated;
GRANT SELECT ON localized_db_values TO anon;

-- Create view for easy querying
CREATE OR REPLACE VIEW vw_localized_values AS
SELECT 
  entity_type,
  entity_key,
  language_code,
  label,
  description,
  sort_order,
  metadata
FROM localized_db_values
WHERE is_active = true
ORDER BY entity_type, sort_order NULLS LAST, label;

GRANT SELECT ON vw_localized_values TO authenticated;
GRANT SELECT ON vw_localized_values TO anon;

COMMENT ON VIEW vw_localized_values IS 'Simplified view of active localized database values for easy querying';
