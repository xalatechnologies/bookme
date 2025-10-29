-- Migration: Enhance Localized Database Values System
-- Description: Adds additional entity types and helper functions for database localization
-- Date: 2025-10-29

-- ============================================================================
-- PART 1: Add Additional Entity Types to localized_db_values
-- ============================================================================

-- Booking Types
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English
('booking_type', 'regular', 'en', 'Regular Booking', 'Standard single booking', 1, true),
('booking_type', 'recurring', 'en', 'Recurring Booking', 'Repeating booking pattern', 2, true),
('booking_type', 'group', 'en', 'Group Booking', 'Multiple facilities or group event', 3, true),

-- Norwegian
('booking_type', 'regular', 'no', 'Vanlig booking', 'Standard enkeltbooking', 1, true),
('booking_type', 'recurring', 'no', 'Gjentakende booking', 'Gjentakende bookingmønster', 2, true),
('booking_type', 'group', 'no', 'Gruppebooking', 'Flere fasiliteter eller gruppearrangement', 3, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Time Slots / Duration Preferences
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active, metadata) VALUES
-- English
('time_slot', 'morning', 'en', 'Morning (6:00-12:00)', 'Early morning slots', 1, true, '{"start": "06:00", "end": "12:00"}'::jsonb),
('time_slot', 'afternoon', 'en', 'Afternoon (12:00-18:00)', 'Afternoon slots', 2, true, '{"start": "12:00", "end": "18:00"}'::jsonb),
('time_slot', 'evening', 'en', 'Evening (18:00-22:00)', 'Evening slots', 3, true, '{"start": "18:00", "end": "22:00"}'::jsonb),
('time_slot', 'all_day', 'en', 'All Day', 'Any time of day', 0, true, '{"start": "00:00", "end": "23:59"}'::jsonb),

-- Norwegian
('time_slot', 'morning', 'no', 'Morgen (6:00-12:00)', 'Tidlige morgentimer', 1, true, '{"start": "06:00", "end": "12:00"}'::jsonb),
('time_slot', 'afternoon', 'no', 'Ettermiddag (12:00-18:00)', 'Ettermiddagstimer', 2, true, '{"start": "12:00", "end": "18:00"}'::jsonb),
('time_slot', 'evening', 'no', 'Kveld (18:00-22:00)', 'Kveldstimer', 3, true, '{"start": "18:00", "end": "22:00"}'::jsonb),
('time_slot', 'all_day', 'no', 'Hele dagen', 'Når som helst', 0, true, '{"start": "00:00", "end": "23:59"}'::jsonb)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata;

-- Capacity Ranges (for filters)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active, metadata) VALUES
-- English
('capacity_range', 'small', 'en', '1-20 people', 'Small gatherings', 1, true, '{"min": 1, "max": 20}'::jsonb),
('capacity_range', 'medium', 'en', '21-50 people', 'Medium-sized groups', 2, true, '{"min": 21, "max": 50}'::jsonb),
('capacity_range', 'large', 'en', '51-100 people', 'Large events', 3, true, '{"min": 51, "max": 100}'::jsonb),
('capacity_range', 'extra-large', 'en', '100+ people', 'Very large events', 4, true, '{"min": 101, "max": 1000}'::jsonb),

-- Norwegian
('capacity_range', 'small', 'no', '1-20 personer', 'Små sammenkomster', 1, true, '{"min": 1, "max": 20}'::jsonb),
('capacity_range', 'medium', 'no', '21-50 personer', 'Mellomstore grupper', 2, true, '{"min": 21, "max": 50}'::jsonb),
('capacity_range', 'large', 'no', '51-100 personer', 'Store arrangementer', 3, true, '{"min": 51, "max": 100}'::jsonb),
('capacity_range', 'extra-large', 'no', '100+ personer', 'Svært store arrangementer', 4, true, '{"min": 101, "max": 1000}'::jsonb)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata;

-- Locations/Areas (Example data - customize for your municipality)
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English
('location', 'drammen_sentrum', 'en', 'Drammen Center', 'Central Drammen area', 1, true),
('location', 'stromsø', 'en', 'Strømsø', 'Strømsø district', 2, true),
('location', 'bragernes', 'en', 'Bragernes', 'Bragernes district', 3, true),
('location', 'austad', 'en', 'Austad', 'Austad area', 4, true),
('location', 'konnerud', 'en', 'Konnerud', 'Konnerud area', 5, true),

-- Norwegian
('location', 'drammen_sentrum', 'no', 'Drammen sentrum', 'Sentrale Drammen', 1, true),
('location', 'stromsø', 'no', 'Strømsø', 'Strømsø bydel', 2, true),
('location', 'bragernes', 'no', 'Bragernes', 'Bragernes bydel', 3, true),
('location', 'austad', 'no', 'Austad', 'Austad område', 4, true),
('location', 'konnerud', 'no', 'Konnerud', 'Konnerud område', 5, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Accessibility Features
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English
('accessibility', 'wheelchair', 'en', 'Wheelchair Accessible', 'Fully wheelchair accessible', 1, true),
('accessibility', 'elevator', 'en', 'Elevator', 'Building has elevator access', 2, true),
('accessibility', 'ramp', 'en', 'Ramp Access', 'Ramp entrance available', 3, true),
('accessibility', 'hearing_loop', 'en', 'Hearing Loop', 'Hearing loop system installed', 4, true),
('accessibility', 'accessible_toilet', 'en', 'Accessible Toilet', 'Accessible toilet facilities', 5, true),

-- Norwegian
('accessibility', 'wheelchair', 'no', 'Rullestoltilgjengelig', 'Fullt rullestoltilgjengelig', 1, true),
('accessibility', 'elevator', 'no', 'Heis', 'Bygget har heistilgang', 2, true),
('accessibility', 'ramp', 'no', 'Rampe', 'Rampeinngang tilgjengelig', 3, true),
('accessibility', 'hearing_loop', 'no', 'Teleslynge', 'Teleslyngesystem installert', 4, true),
('accessibility', 'accessible_toilet', 'no', 'Tilgjengelig toalett', 'Tilgjengelige toalettfasiliteter', 5, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Payment Status
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English
('payment_status', 'pending', 'en', 'Pending', 'Payment is pending', 1, true),
('payment_status', 'succeeded', 'en', 'Paid', 'Payment succeeded', 2, true),
('payment_status', 'failed', 'en', 'Failed', 'Payment failed', 3, true),
('payment_status', 'refunded', 'en', 'Refunded', 'Payment refunded', 4, true),

-- Norwegian
('payment_status', 'pending', 'no', 'Ventende', 'Betaling venter', 1, true),
('payment_status', 'succeeded', 'no', 'Betalt', 'Betaling fullført', 2, true),
('payment_status', 'failed', 'no', 'Mislyktes', 'Betaling mislyktes', 3, true),
('payment_status', 'refunded', 'no', 'Refundert', 'Betaling refundert', 4, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Recurrence Patterns
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English
('recurrence_pattern', 'daily', 'en', 'Daily', 'Repeats every day', 1, true),
('recurrence_pattern', 'weekly', 'en', 'Weekly', 'Repeats every week', 2, true),
('recurrence_pattern', 'biweekly', 'en', 'Bi-weekly', 'Repeats every two weeks', 3, true),
('recurrence_pattern', 'monthly', 'en', 'Monthly', 'Repeats every month', 4, true),

-- Norwegian
('recurrence_pattern', 'daily', 'no', 'Daglig', 'Gjentas hver dag', 1, true),
('recurrence_pattern', 'weekly', 'no', 'Ukentlig', 'Gjentas hver uke', 2, true),
('recurrence_pattern', 'biweekly', 'no', 'Annenhver uke', 'Gjentas annenhver uke', 3, true),
('recurrence_pattern', 'monthly', 'no', 'Månedlig', 'Gjentas hver måned', 4, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Days of Week
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active, metadata) VALUES
-- English
('day_of_week', '0', 'en', 'Sunday', 'Sunday', 0, true, '{"day_number": 0}'::jsonb),
('day_of_week', '1', 'en', 'Monday', 'Monday', 1, true, '{"day_number": 1}'::jsonb),
('day_of_week', '2', 'en', 'Tuesday', 'Tuesday', 2, true, '{"day_number": 2}'::jsonb),
('day_of_week', '3', 'en', 'Wednesday', 'Wednesday', 3, true, '{"day_number": 3}'::jsonb),
('day_of_week', '4', 'en', 'Thursday', 'Thursday', 4, true, '{"day_number": 4}'::jsonb),
('day_of_week', '5', 'en', 'Friday', 'Friday', 5, true, '{"day_number": 5}'::jsonb),
('day_of_week', '6', 'en', 'Saturday', 'Saturday', 6, true, '{"day_number": 6}'::jsonb),

-- Norwegian
('day_of_week', '0', 'no', 'Søndag', 'Søndag', 0, true, '{"day_number": 0}'::jsonb),
('day_of_week', '1', 'no', 'Mandag', 'Mandag', 1, true, '{"day_number": 1}'::jsonb),
('day_of_week', '2', 'no', 'Tirsdag', 'Tirsdag', 2, true, '{"day_number": 2}'::jsonb),
('day_of_week', '3', 'no', 'Onsdag', 'Onsdag', 3, true, '{"day_number": 3}'::jsonb),
('day_of_week', '4', 'no', 'Torsdag', 'Torsdag', 4, true, '{"day_number": 4}'::jsonb),
('day_of_week', '5', 'no', 'Fredag', 'Fredag', 5, true, '{"day_number": 5}'::jsonb),
('day_of_week', '6', 'no', 'Lørdag', 'Lørdag', 6, true, '{"day_number": 6}'::jsonb)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata;

-- ============================================================================
-- PART 2: Enhanced Helper Functions
-- ============================================================================

-- Function to get all localized values for an entity type
CREATE OR REPLACE FUNCTION get_localized_values_by_type(
  p_entity_type text,
  p_language_code text DEFAULT 'no'
)
RETURNS TABLE(
  entity_key text,
  label text,
  description text,
  sort_order int,
  metadata jsonb
) AS $$
  SELECT
    entity_key,
    label,
    description,
    sort_order,
    metadata
  FROM localized_db_values
  WHERE entity_type = p_entity_type
    AND language_code = p_language_code
    AND is_active = true
  ORDER BY
    CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END,
    sort_order ASC,
    label ASC;
$$ LANGUAGE sql STABLE;

-- Function to batch get multiple localized values
CREATE OR REPLACE FUNCTION get_localized_values_batch(
  p_entity_type text,
  p_entity_keys text[],
  p_language_code text DEFAULT 'no'
)
RETURNS TABLE(
  entity_key text,
  label text,
  description text
) AS $$
  SELECT
    entity_key,
    label,
    description
  FROM localized_db_values
  WHERE entity_type = p_entity_type
    AND entity_key = ANY(p_entity_keys)
    AND language_code = p_language_code
    AND is_active = true;
$$ LANGUAGE sql STABLE;

-- Function to search localized values (for autocomplete/search)
CREATE OR REPLACE FUNCTION search_localized_values(
  p_entity_type text,
  p_search_term text,
  p_language_code text DEFAULT 'no',
  p_limit int DEFAULT 10
)
RETURNS TABLE(
  entity_key text,
  label text,
  description text,
  sort_order int,
  relevance real
) AS $$
  SELECT
    entity_key,
    label,
    description,
    sort_order,
    -- Calculate relevance score based on position of match
    CASE
      WHEN LOWER(label) = LOWER(p_search_term) THEN 1.0
      WHEN LOWER(label) LIKE LOWER(p_search_term) || '%' THEN 0.9
      WHEN LOWER(label) LIKE '%' || LOWER(p_search_term) || '%' THEN 0.7
      WHEN LOWER(description) LIKE '%' || LOWER(p_search_term) || '%' THEN 0.5
      ELSE 0.3
    END as relevance
  FROM localized_db_values
  WHERE entity_type = p_entity_type
    AND language_code = p_language_code
    AND is_active = true
    AND (
      LOWER(label) LIKE '%' || LOWER(p_search_term) || '%'
      OR LOWER(description) LIKE '%' || LOWER(p_search_term) || '%'
    )
  ORDER BY relevance DESC, sort_order ASC NULLS LAST
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Function to get entity types (for admin UI)
CREATE OR REPLACE FUNCTION get_available_entity_types()
RETURNS TABLE(
  entity_type text,
  value_count bigint,
  languages text[]
) AS $$
  SELECT
    entity_type,
    COUNT(*) as value_count,
    ARRAY_AGG(DISTINCT language_code ORDER BY language_code) as languages
  FROM localized_db_values
  WHERE is_active = true
  GROUP BY entity_type
  ORDER BY entity_type;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- PART 3: Indexes for Performance
-- ============================================================================

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_localized_db_values_type_lang_active
  ON localized_db_values(entity_type, language_code, is_active)
  WHERE is_active = true;

-- Add text search index for label and description
CREATE INDEX IF NOT EXISTS idx_localized_db_values_label_trgm
  ON localized_db_values USING gin(label gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_localized_db_values_description_trgm
  ON localized_db_values USING gin(description gin_trgm_ops);

-- ============================================================================
-- PART 4: Materialized View for Fast Lookups (Optional)
-- ============================================================================

-- Create a materialized view for frequently accessed values
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_localized_values_en AS
SELECT
  entity_type,
  entity_key,
  label,
  description,
  sort_order,
  metadata
FROM localized_db_values
WHERE language_code = 'en' AND is_active = true
ORDER BY entity_type, sort_order NULLS LAST, label;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_localized_values_no AS
SELECT
  entity_type,
  entity_key,
  label,
  description,
  sort_order,
  metadata
FROM localized_db_values
WHERE language_code = 'no' AND is_active = true
ORDER BY entity_type, sort_order NULLS LAST, label;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_mv_localized_values_en_type
  ON mv_localized_values_en(entity_type);

CREATE INDEX IF NOT EXISTS idx_mv_localized_values_no_type
  ON mv_localized_values_no(entity_type);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_localized_values_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_localized_values_en;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_localized_values_no;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 5: Comments for Documentation
-- ============================================================================

COMMENT ON FUNCTION get_localized_values_by_type IS 'Retrieves all localized values for a specific entity type and language';
COMMENT ON FUNCTION get_localized_values_batch IS 'Batch retrieves multiple localized values by their keys';
COMMENT ON FUNCTION search_localized_values IS 'Searches localized values with relevance scoring for autocomplete/search';
COMMENT ON FUNCTION get_available_entity_types IS 'Lists all entity types with their value counts and available languages';
COMMENT ON FUNCTION refresh_localized_values_cache IS 'Refreshes materialized views for localized values (run after bulk updates)';

-- ============================================================================
-- PART 6: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_localized_values_by_type TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_localized_values_batch TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_localized_values TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_available_entity_types TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_localized_values_cache TO authenticated;

GRANT SELECT ON mv_localized_values_en TO authenticated, anon;
GRANT SELECT ON mv_localized_values_no TO authenticated, anon;
