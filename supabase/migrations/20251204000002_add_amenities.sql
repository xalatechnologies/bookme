-- Add amenities to localized_db_values table
-- This replaces accessibility features with facility amenities

INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English amenities
('amenity', 'wifi', 'en', 'WiFi', 'Wireless internet connection', 1, true),
('amenity', 'parking', 'en', 'Parking', 'Parking available', 2, true),
('amenity', 'dusj', 'en', 'Shower', 'Shower facilities', 3, true),
('amenity', 'badstue', 'en', 'Sauna', 'Sauna available', 4, true),
('amenity', 'fotball', 'en', 'Football', 'Football equipment/field', 5, true),
('amenity', 'garderobe', 'en', 'Changing Room', 'Changing room available', 6, true),
('amenity', 'projektor', 'en', 'Projector', 'Projector available', 7, true),
('amenity', 'lydanlegg', 'en', 'Sound System', 'Sound system available', 8, true),
('amenity', 'kj\u00f8kken', 'en', 'Kitchen', 'Kitchen facilities', 9, true),
('amenity', 'kaffemaskin', 'en', 'Coffee Machine', 'Coffee machine available', 10, true),

-- Norwegian amenities
('amenity', 'wifi', 'no', 'WiFi', 'Tr\u00e5dl\u00f8st internett', 1, true),
('amenity', 'parking', 'no', 'Parkering', 'Parkering tilgjengelig', 2, true),
('amenity', 'dusj', 'no', 'Dusj', 'Dusjfasiliteter', 3, true),
('amenity', 'badstue', 'no', 'Badstue', 'Badstue tilgjengelig', 4, true),
('amenity', 'fotball', 'no', 'Fotball', 'Fotballutstyr/bane', 5, true),
('amenity', 'garderobe', 'no', 'Garderobe', 'Garderobe tilgjengelig', 6, true),
('amenity', 'projektor', 'no', 'Projektor', 'Projektor tilgjengelig', 7, true),
('amenity', 'lydanlegg', 'no', 'Lydanlegg', 'Lydanlegg tilgjengelig', 8, true),
('amenity', 'kj\u00f8kken', 'no', 'Kj\u00f8kken', 'Kj\u00f8kkenfasiliteter', 9, true),
('amenity', 'kaffemaskin', 'no', 'Kaffemaskin', 'Kaffemaskin tilgjengelig', 10, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;
