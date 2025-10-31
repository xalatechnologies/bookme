-- Migration: Seed Amenity Translations
-- Description: Adds translations for common facility amenities

-- Amenity Translations
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English amenities
('amenity', 'garderober', 'en', 'Changing Rooms', 'Changing room facilities', 1, true),
('amenity', 'dusj', 'en', 'Showers', 'Shower facilities', 2, true),
('amenity', 'parkering', 'en', 'Parking', 'Parking available', 3, true),
('amenity', 'lyd-lys', 'en', 'Sound/Light', 'Sound and lighting system', 4, true),
('amenity', 'tribuner', 'en', 'Bleachers', 'Spectator seating', 5, true),
('amenity', 'scene', 'en', 'Stage', 'Performance stage', 6, true),
('amenity', 'projektor', 'en', 'Projector', 'Presentation projector', 7, true),
('amenity', 'kjøkken', 'en', 'Kitchen', 'Kitchen facilities', 8, true),
('amenity', 'kunstgress', 'en', 'Artificial Turf', 'Artificial grass surface', 9, true),
('amenity', 'flombelysning', 'en', 'Floodlights', 'Outdoor lighting', 10, true),
('amenity', '25m-basseng', 'en', '25m Pool', '25-meter swimming pool', 11, true),
('amenity', 'cafeteria', 'en', 'Cafeteria', 'Food and beverage area', 12, true),
('amenity', 'innendørs', 'en', 'Indoor', 'Indoor facility', 13, true),
('amenity', 'profesjonell-underlag', 'en', 'Professional Surface', 'Professional grade surface', 14, true),
('amenity', 'utstyr-utleie', 'en', 'Equipment Rental', 'Equipment rental available', 15, true),
('amenity', 'redningsutstyr', 'en', 'Safety Equipment', 'Life-saving equipment', 16, true),
('amenity', 'wifi', 'en', 'WiFi', 'Wireless internet access', 17, true),
('amenity', 'whiteboard', 'en', 'Whiteboard', 'Whiteboard available', 18, true),
('amenity', 'fotball', 'en', 'Football', 'Football facilities', 19, true),
('amenity', 'basketball', 'en', 'Basketball', 'Basketball facilities', 20, true),

-- Norwegian amenities
('amenity', 'garderober', 'no', 'Garderober', 'Garderobefasiliteter', 1, true),
('amenity', 'dusj', 'no', 'Dusj', 'Dusjfasiliteter', 2, true),
('amenity', 'parkering', 'no', 'Parkering', 'Parkering tilgjengelig', 3, true),
('amenity', 'lyd-lys', 'no', 'Lyd/lys', 'Lyd og lyssystem', 4, true),
('amenity', 'tribuner', 'no', 'Tribuner', 'Tribuneplass', 5, true),
('amenity', 'scene', 'no', 'Scene', 'Scene for forestillinger', 6, true),
('amenity', 'projektor', 'no', 'Projektor', 'Presentasjonsprojektor', 7, true),
('amenity', 'kjøkken', 'no', 'Kjøkken', 'Kjøkkenfasiliteter', 8, true),
('amenity', 'kunstgress', 'no', 'Kunstgress', 'Kunstgressbane', 9, true),
('amenity', 'flombelysning', 'no', 'Flombelysning', 'Utendørs belysning', 10, true),
('amenity', '25m-basseng', 'no', '25m basseng', '25-meter svømmebasseng', 11, true),
('amenity', 'cafeteria', 'no', 'Cafeteria', 'Mat og drikke', 12, true),
('amenity', 'innendørs', 'no', 'Innendørs', 'Innendørs fasilitet', 13, true),
('amenity', 'profesjonell-underlag', 'no', 'Profesjonell underlag', 'Profesjonelt underlag', 14, true),
('amenity', 'utstyr-utleie', 'no', 'Utstyr utleie', 'Utstyrsutleie tilgjengelig', 15, true),
('amenity', 'redningsutstyr', 'no', 'Redningsutstyr', 'Livredningsutstyr', 16, true),
('amenity', 'wifi', 'no', 'WiFi', 'Trådløst internett', 17, true),
('amenity', 'whiteboard', 'no', 'Whiteboard', 'Whiteboard tilgjengelig', 18, true),
('amenity', 'fotball', 'no', 'Fotball', 'Fotballfasiliteter', 19, true),
('amenity', 'basketball', 'no', 'Basketball', 'Basketballfasiliteter', 20, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

COMMENT ON TABLE localized_db_values IS 'Stores translated labels for database values including amenities, facility types, statuses, etc. Used for dynamic business data that may grow over time.';

