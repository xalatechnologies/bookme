-- Migration: Seed Localization Data
-- Description: Populates localized_db_values table with facility types, locations, 
-- accessibility features, and capacity ranges in both English and Norwegian

-- Facility Types
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English facility types
('facility_type', 'idrettshall', 'en', 'Sports Hall', 'Large sports facility for various activities', 1, true),
('facility_type', 'kulturhus', 'en', 'Culture House', 'Cultural center for events and gatherings', 2, true),
('facility_type', 'møterom', 'en', 'Meeting Room', 'Small to medium meeting space', 3, true),
('facility_type', 'fotballbane', 'en', 'Football Field', 'Outdoor football/soccer field', 4, true),
('facility_type', 'svømmehall', 'en', 'Swimming Pool', 'Indoor or outdoor swimming facility', 5, true),
('facility_type', 'tennisbane', 'en', 'Tennis Court', 'Tennis court facility', 6, true),

-- Norwegian facility types
('facility_type', 'idrettshall', 'no', 'Idrettshall', 'Stort idrettsanlegg for ulike aktiviteter', 1, true),
('facility_type', 'kulturhus', 'no', 'Kulturhus', 'Kulturhus for arrangementer og samlinger', 2, true),
('facility_type', 'møterom', 'no', 'Møterom', 'Lite til middels møterom', 3, true),
('facility_type', 'fotballbane', 'no', 'Fotballbane', 'Ute fotballbane', 4, true),
('facility_type', 'svømmehall', 'no', 'Svømmehall', 'Inne- eller utendørs svømmebasseng', 5, true),
('facility_type', 'tennisbane', 'no', 'Tennisbane', 'Tennisbane', 6, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Locations
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English locations
('location', 'drammen_sentrum', 'en', 'Drammen City Center', 'Central Drammen area', 1, true),
('location', 'strømsø', 'en', 'Strømsø', 'Strømsø neighborhood', 2, true),
('location', 'bragernes', 'en', 'Bragernes', 'Bragernes neighborhood', 3, true),
('location', 'spiralen', 'en', 'Spiralen', 'Spiralen area', 4, true),
('location', 'konnerud', 'en', 'Konnerud', 'Konnerud neighborhood', 5, true),
('location', 'åssiden', 'en', 'Åssiden', 'Åssiden neighborhood', 6, true),

-- Norwegian locations
('location', 'drammen_sentrum', 'no', 'Drammen Sentrum', 'Sentrum i Drammen', 1, true),
('location', 'strømsø', 'no', 'Strømsø', 'Strømsø område', 2, true),
('location', 'bragernes', 'no', 'Bragernes', 'Bragernes område', 3, true),
('location', 'spiralen', 'no', 'Spiralen', 'Spiralen område', 4, true),
('location', 'konnerud', 'no', 'Konnerud', 'Konnerud område', 5, true),
('location', 'åssiden', 'no', 'Åssiden', 'Åssiden område', 6, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Accessibility Features
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English accessibility
('accessibility', 'wheelchair', 'en', 'Wheelchair Accessible', 'Facility accessible for wheelchair users', 1, true),
('accessibility', 'hearing-loop', 'en', 'Hearing Loop', 'Audio induction loop for hearing impaired', 2, true),
('accessibility', 'visual-aids', 'en', 'Visual Aids', 'Visual assistance features for visually impaired', 3, true),

-- Norwegian accessibility
('accessibility', 'wheelchair', 'no', 'Rullestoltilpasset', 'Fasilitet tilgjengelig for rullestolbrukere', 1, true),
('accessibility', 'hearing-loop', 'no', 'Teleslynge', 'Teleslynge for hørselshemmede', 2, true),
('accessibility', 'visual-aids', 'no', 'Synshjelpemidler', 'Visuelle hjelpemidler for svaksynte', 3, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Capacity Ranges
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English capacity ranges
('capacity_range', 'small', 'en', 'Small (1-20)', 'Small capacity: 1-20 people', 1, true),
('capacity_range', 'medium', 'en', 'Medium (21-50)', 'Medium capacity: 21-50 people', 2, true),
('capacity_range', 'large', 'en', 'Large (51-100)', 'Large capacity: 51-100 people', 3, true),
('capacity_range', 'extra-large', 'en', 'Extra Large (100+)', 'Extra large capacity: 100+ people', 4, true),

-- Norwegian capacity ranges
('capacity_range', 'small', 'no', 'Liten (1-20)', 'Liten kapasitet: 1-20 personer', 1, true),
('capacity_range', 'medium', 'no', 'Middels (21-50)', 'Middels kapasitet: 21-50 personer', 2, true),
('capacity_range', 'large', 'no', 'Stor (51-100)', 'Stor kapasitet: 51-100 personer', 3, true),
('capacity_range', 'extra-large', 'no', 'Ekstra stor (100+)', 'Ekstra stor kapasitet: 100+ personer', 4, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Add comments for documentation
COMMENT ON TABLE localized_db_values IS 'Stores translated labels for database values (enums, statuses, types). Used for dynamic business data that may grow over time (e.g., facility types, locations).';

